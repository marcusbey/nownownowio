import { getClientIp } from "@/lib/api/ip";
import { auth } from "@/lib/auth/helper";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Helper function to get view count
async function getViewCount(postId: string) {
  try {
    const count = await prisma.postView.count({
      where: { postId },
    });
    return count;
  } catch (error) {
    console.error("Error getting view count:", error);
    return 0;
  }
}

// Helper function to track a new view
async function trackView(postId: string, viewerId: string, clientIp: string) {
  try {
    // First check if the post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true }
    });

    if (!post) {
      throw new Error(`Post ${postId} not found`);
    }

    // Then try to upsert the view
    await prisma.postView.upsert({
      where: {
        postId_viewerId_clientIp: {
          postId,
          viewerId,
          clientIp,
        },
      },
      update: {
        viewedAt: new Date(),
      },
      create: {
        postId,
        viewerId,
        clientIp,
      },
    });
  } catch (error) {
    console.error("Error tracking view:", {
      error,
      postId,
      viewerId,
      clientIp
    });
    throw error;
  }
}

// Make it fully dynamic
export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const params = await context.params;
    const count = await getViewCount(params.postId);
    return NextResponse.json({ viewCount: count });
  } catch (error) {
    console.error("Error in GET /api/v1/posts/[postId]/views:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const user = await auth();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const clientIp = getClientIp(request);
    const params = await context.params;
    await trackView(params.postId, user.id, clientIp);

    const count = await getViewCount(params.postId);
    return NextResponse.json({ viewCount: count });
  } catch (error) {
    // Log the full error details
    console.error("Error in POST /api/v1/posts/[postId]/views:", {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
      } : error,
      postId: context.params.postId,
    });

    // Return a more specific error message if possible
    const message = error instanceof Error ? error.message : "Failed to track view";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
