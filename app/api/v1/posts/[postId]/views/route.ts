import { getClientIp } from "@/lib/api/ip";
import { auth } from "@/lib/auth/helper";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
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
    logger.error("Error getting view count:", { error, postId });
    return 0;
  }
}

// Helper function to track a new view
async function trackView(postId: string, viewerId: string, clientIp: string, source = "app") {
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
        source, // Update the source field
      },
      create: {
        postId,
        viewerId,
        clientIp,
        source, // Set the source field
      },
    });
  } catch (error) {
    logger.error("Error tracking view:", {
      error,
      postId,
      viewerId,
      clientIp,
      source
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
    // Properly await params in Next.js 15
    const { postId } = await context.params;
    const count = await getViewCount(postId);
    return NextResponse.json({ views: count });
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
    // Allow anonymous views with a generated ID
    const viewerId = user?.id ?? `anon-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

    const clientIp = getClientIp(request);
    // Properly await params in Next.js 15
    const { postId } = await context.params;
    await trackView(postId, viewerId, clientIp, "app");

    const count = await getViewCount(postId);
    return NextResponse.json({ views: count });
  } catch (error) {
    // Log the full error details
    logger.error("Error in POST /api/v1/posts/[postId]/views:", {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
      } : error,
      // Safely access postId from the context params
      postId: (await context.params).postId,
    });

    // Return a more specific error message if possible
    const message = error instanceof Error ? error.message : "Failed to track view";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
