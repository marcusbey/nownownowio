import { getClientIp } from '@/lib/api/ip';
import { queuePostView } from "@/lib/api/view-tracker";
import { logger } from '@/lib/logger';
import { getWidgetCorsHeaders } from '@/lib/now-widget';
import { prisma } from '@/lib/prisma';
import type { Prisma } from "@prisma/client";
import { type NextRequest, NextResponse } from 'next/server';

// Make it fully dynamic
export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin') ?? '*';
  const headers = getWidgetCorsHeaders(origin);

  return new NextResponse(null, {
    status: 204,
    headers: {
      ...headers,
      'Access-Control-Max-Age': '86400', // Cache preflight response for 1 day
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const origin = req.headers.get('origin') ?? '*';
    const corsHeaders = getWidgetCorsHeaders(origin);

    // Handle preflight request
    if (req.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // Parse request body to get post ID
    const body = await req.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing postId"
        },
        {
          status: 400,
          headers: corsHeaders
        }
      );
    }

    // Get client IP address
    const clientIp = getClientIp(req) ?? "unknown";

    // Get or generate viewer ID
    const headers = new Headers(corsHeaders);
    const viewerId = req.headers.get("x-viewer-id") ?? generateWidgetViewerId();
    headers.set("x-viewer-id", viewerId);

    // Queue view for batch processing
    queuePostView(postId, viewerId, clientIp);

    return NextResponse.json(
      {
        success: true,
        message: "View queued for processing",
        viewerId
      },
      {
        status: 202,
        headers
      }
    );

  } catch (error) {
    logger.error("Error in widget track-view:", {
      error: error instanceof Error ? error.message : String(error)
    });

    const origin = req.headers.get('origin') ?? '*';
    const corsHeaders = getWidgetCorsHeaders(origin);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to track view"
      },
      {
        status: 500,
        headers: corsHeaders
      }
    );
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

    // Define update and create objects to handle missing source column
    const updateData: Prisma.PostViewUpdateInput = {
      viewedAt: new Date(),
    };

    const createData: Prisma.PostViewCreateInput = {
      post: { connect: { id: postId } },
      viewerId,
      clientIp,
    };

    // Once the migration has been applied, uncomment the following lines:
    updateData.source = "widget";
    createData.source = "widget";

    // Then try to upsert the view
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
  } catch (error) {
    logger.error("Error tracking view:", {
      error,
      postId,
      viewerId,
      clientIp
      // Add source back when migration is applied:
      // source: "widget"
    });
    throw error;
  }
}

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

/**
 * Generate a random viewer ID for widget views
 */
function generateWidgetViewerId(): string {
  return `widget-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}
