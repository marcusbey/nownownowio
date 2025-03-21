import { getClientIp } from "@/lib/api/ip";
import { logger } from "@/lib/logger";
import { getWidgetCorsHeaders } from "@/lib/now-widget";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";

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
    // Define the data objects with proper typing - omitting source field as it doesn't exist in the database yet
    const updateData: Prisma.PostViewUpdateInput = {
      viewedAt: new Date(),
    };

    const createData: Prisma.PostViewCreateInput = {
      post: { connect: { id: postId } },
      viewerId,
      clientIp,
    };

    // NOTE: The source field is defined in the schema but hasn't been added to the database yet
    // Once the migration has been applied, uncomment the following lines:
    updateData.source = "app";
    createData.source = "app";

    await prisma.postView.upsert({
      where: {
        postId_viewerId_clientIp: {
          postId,
          viewerId,
          clientIp,
        },
      },
      update: updateData,
      create: createData,
    });

    // Get the updated view count
    const count = await prisma.postView.count({
      where: { postId },
    });

    return count;
  } catch (error) {
    // Safely log the error with proper error handling for null values
    logger.error("Error tracking view:", {
      error: error instanceof Error ? { message: error.message, stack: error.stack } : String(error || 'Unknown error'),
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
export const runtime = "nodejs";

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

export async function POST(request: NextRequest, { params }: { params: Promise<Record<string, string>> }) {
  const origin = request.headers.get("origin") ?? "*";
  const headers = getWidgetCorsHeaders(origin);

  try {
    // Properly await params in Next.js 15
    // This is required even if we're not using any specific parameter from it
    await params;

    // Safely parse the request body with error handling
    let body: { postId?: string; viewerId?: string } = {};
    try {
      body = await request.json();
    } catch (parseError) {
      logger.error("Error parsing request body in track-view:", {
        error: parseError instanceof Error ? parseError.message : String(parseError || 'Unknown error')
      });
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400, headers }
      );
    }

    const { postId, viewerId } = body;

    if (!postId) {
      return NextResponse.json(
        { error: "Missing postId" },
        { status: 400, headers }
      );
    }

    // Use provided viewerId or generate an anonymous one
    const actualViewerId = viewerId ?? `anon-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    const clientIp = getClientIp(request);

    const viewCount = await trackView(postId, actualViewerId, clientIp);

    return NextResponse.json({ viewCount }, { headers });
  } catch (error) {
    // Safely log the error with proper error handling for null values
    logger.error("Error in POST /api/v1/posts/track-view:", {
      error: error instanceof Error ? { message: error.message, stack: error.stack } : String(error || 'Unknown error')
    });

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500, headers }
    );
  }
}
