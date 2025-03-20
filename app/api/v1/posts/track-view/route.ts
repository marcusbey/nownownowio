import { getClientIp } from "@/lib/api/ip";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { getWidgetCorsHeaders } from "@/lib/now-widget";
import { type NextRequest, NextResponse } from "next/server";

// Helper function to track a new view
async function trackView(postId: string, viewerId: string, clientIp: string, source: string) {
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
        // Update the source if it's coming from a different place
        source,
      },
      create: {
        postId,
        viewerId,
        clientIp,
        source,
      },
    });

    // Get the updated view count
    const count = await prisma.postView.count({
      where: { postId },
    });

    return count;
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

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin") ?? "*";
  const headers = getWidgetCorsHeaders(origin);
  
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...headers,
      "Access-Control-Max-Age": "86400", // Cache preflight response for 1 day
    },
  });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin") ?? "*";
  const headers = getWidgetCorsHeaders(origin);

  try {
    const body = await request.json();
    const { postId, viewerId, source = "app" } = body;

    if (!postId) {
      return NextResponse.json(
        { error: "Missing postId" },
        { status: 400, headers }
      );
    }

    // Use provided viewerId or generate an anonymous one
    const actualViewerId = viewerId || `anon-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    const clientIp = getClientIp(request);
    
    const viewCount = await trackView(postId, actualViewerId, clientIp, source);

    return NextResponse.json({ viewCount }, { headers });
  } catch (error) {
    logger.error("Error in POST /api/v1/posts/track-view:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500, headers }
    );
  }
}
