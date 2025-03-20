import { verifyWidgetToken, getWidgetCorsHeaders } from '@/lib/now-widget';
import { getClientIp } from '@/lib/api/ip';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
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
  const origin = req.headers.get('origin') ?? '*';
  const headers = getWidgetCorsHeaders(origin);

  try {
    // Parse the request body
    const body = await req.json();
    const { postId, viewerId, orgId } = body;
    const token = req.headers.get('Authorization')?.split(' ')[1];

    // Log the incoming request
    logger.info('Widget track-view request received', { 
      postId, 
      orgId,
      origin,
      hasToken: !!token 
    });

    // Validate required parameters
    if (!postId || !orgId || !token) {
      logger.warn('Missing required parameters', { postId, orgId, hasToken: !!token });
      return NextResponse.json(
        { error: 'Invalid request', message: 'Post ID, organization ID, and token are required' },
        { status: 400, headers }
      );
    }

    // Verify the widget token
    const isTokenValid = verifyWidgetToken(token, orgId);
    if (!isTokenValid) {
      logger.warn('Invalid widget token', { orgId, origin });
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or expired token' },
        { status: 401, headers }
      );
    }

    // Generate a viewer ID if not provided
    const actualViewerId = viewerId || `widget-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    const clientIp = getClientIp(req);

    // Track the view
    await trackView(postId, actualViewerId, clientIp);

    // Get the updated view count
    const count = await getViewCount(postId);

    // Log successful request
    logger.info('Widget track-view request successful', { 
      postId,
      orgId,
      origin
    });

    return NextResponse.json(
      { views: count },
      { headers }
    );
  } catch (error) {
    // Log the error
    logger.error('Error in widget track-view', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
      } : error,
    });

    // Return a more specific error message if possible
    const message = error instanceof Error ? error.message : "Failed to track view";
    return NextResponse.json(
      { error: 'Server error', message },
      { status: 500, headers }
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
        source: "widget", // Set source as widget
      },
      create: {
        postId,
        viewerId,
        clientIp,
        source: "widget", // Set source as widget
      },
    });
  } catch (error) {
    logger.error("Error tracking view:", {
      error,
      postId,
      viewerId,
      clientIp,
      source: "widget"
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
