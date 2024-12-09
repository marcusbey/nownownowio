import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/api/ip";
import { auth } from "@/lib/auth/helper";

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

export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const count = await getViewCount(params.postId);
    return NextResponse.json({ viewCount: count });
  } catch (error) {
    console.error("Error in GET /api/posts/[postId]/views:", error);
    return NextResponse.json(
      { error: "Failed to get view count" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
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
    await trackView(params.postId, user.id, clientIp);
    
    const count = await getViewCount(params.postId);
    return NextResponse.json({ viewCount: count });
  } catch (error) {
    // Log the full error details
    console.error("Error in POST /api/posts/[postId]/views:", {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
      } : error,
      postId: params.postId,
    });

    // Return a more specific error message if possible
    const message = error instanceof Error ? error.message : "Failed to track view";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
