import { verifyWidgetToken, validateWidgetOrigin, getWidgetCorsHeaders } from '@/lib/now-widget';
import { prisma } from '@/lib/prisma';
import { feedbackExtensions } from '@/lib/prisma/prisma.feedback.extends';
import { Prisma } from '@prisma/client';
import { logger } from '@/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';

// Define types for organization and plan data
type OrganizationPlanDetails = {
  websiteUrl: string | null;
  plan: {
    hasFeedbackFeature: boolean;
    maxFeedbackItems: number;
  } | null;
}

export async function OPTIONS(req: NextRequest): Promise<NextResponse> {
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

/**
 * GET handler for retrieving feedback for an organization
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const origin = req.headers.get('origin') ?? '*';
  const headers = getWidgetCorsHeaders(origin);
  const token = req.headers.get('Authorization')?.split(' ')[1];
  
  const { searchParams } = new URL(req.url);
  const organizationId = searchParams.get('orgId');
  
  if (!organizationId) {
    logger.warn('Missing organization ID for feedback retrieval', { origin });
    return NextResponse.json(
      { error: 'Bad request', message: 'Organization ID is required' },
      { status: 400, headers }
    );
  }
  
  // Verify the widget token
  if (!token) {
    logger.warn('Missing authorization token for feedback retrieval', { organizationId, origin });
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authorization token is required' },
      { status: 401, headers }
    );
  }
  
  const isTokenValid = verifyWidgetToken(token, organizationId);
  if (!isTokenValid) {
    logger.warn('Invalid widget token for feedback retrieval', { organizationId, origin });
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Invalid or expired token' },
      { status: 401, headers }
    );
  }
  
  try {
    // Get the widget to validate the origin
    const widget = await prisma.widget.findFirst({
      where: { organizationId }
    });
    
    if (!widget) {
      logger.warn('Widget not found for organization', { organizationId, origin });
      return NextResponse.json(
        { error: 'Widget not configured', message: 'No widget found for this organization' },
        { status: 404, headers }
      );
    }
    
    // Get the organization details to extract the website URL and check plan
    const orgDetails = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        websiteUrl: true,
        image: true,
        bannerImage: true,
        name: true,
        plan: {
          select: {
            hasFeedbackFeature: true,
            maxFeedbackItems: true
          }
        }
      }
    }) as OrganizationPlanDetails | null;
    
    // Extract domain from website URL
    let allowedDomain: string | null = null;
    if (orgDetails?.websiteUrl) {
      try {
        allowedDomain = new URL(orgDetails.websiteUrl).hostname;
      } catch (error) {
        logger.error('Invalid website URL in organization settings', { 
          organizationId, 
          websiteUrl: orgDetails.websiteUrl,
          error
        });
      }
    }
    
    // Validate the request origin
    if (allowedDomain && origin !== '*') {
      const isOriginValid = validateWidgetOrigin(origin, allowedDomain);
      if (!isOriginValid) {
        logger.warn('Invalid origin for feedback retrieval', { 
          organizationId, 
          origin, 
          allowedDomain 
        });
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Invalid request origin' },
          { status: 403, headers }
        );
      }
    }
    
    // Get pagination parameters
    const limit = parseInt(searchParams.get('limit') ?? '10', 10);
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const skip = (page - 1) * limit;
    
    // Get the feedback for the organization, sorted by votes (descending)
    const feedback = await feedbackExtensions.findForOrganization(organizationId, {
      limit,
      skip,
      orderBy: [{ votes: 'desc' }]
    });
    
    // Get the total count for pagination
    const totalCount = await feedbackExtensions.countForOrganization(organizationId);
    
    // Check if the user has voted for any of the feedback items
    const ipAddress = req.headers.get('x-forwarded-for') ?? 
                      req.headers.get('x-real-ip') ?? 
                      'unknown';
    const voterIp = ipAddress.split(',')[0].trim();
    
    const feedbackIds = feedback.map((f: { id: string }) => f.id);
    
    // Initialize userVotes as an empty array
    let userVotes: { feedbackId: string }[] = [];
    
    // Only query for votes if there are feedback items
    if (feedbackIds.length > 0) {
      try {
        // Use raw query to find votes by IP address
        userVotes = await prisma.$queryRaw<{ feedbackId: string }[]>`
          SELECT "feedbackId" FROM "WidgetFeedbackVoter"
          WHERE "feedbackId" IN (${Prisma.join(feedbackIds)}) AND "ipAddress" = ${voterIp}
        `;
      } catch (error) {
        logger.error('Error fetching user votes', {
          error: error instanceof Error ? error.message : String(error),
          feedbackIds,
          voterIp
        });
        // Continue with empty userVotes array
      }
    }
    
    const userVotedFeedbackIds = new Set(userVotes.map((v: { feedbackId: string }) => v.feedbackId));
    
    // Add hasVoted flag to each feedback item
    // Define a proper type for the feedback item
    type FeedbackItem = {
      id: string;
      content: string;
      votes: number;
      status: string;
      createdAt: Date;
      _count?: { voters: number };
    };
    
    const feedbackWithVoteStatus = feedback.map((f: FeedbackItem) => ({
      ...f,
      hasVoted: userVotedFeedbackIds.has(f.id)
    }));
    
    logger.info('Feedback retrieved successfully', { 
      organizationId, 
      count: feedback.length,
      totalCount,
      origin
    });
    
    return NextResponse.json(
      { 
        organization: {
          id: organizationId,
          name: orgDetails?.name,
          image: orgDetails?.image,
          bannerImage: orgDetails?.bannerImage,
          websiteUrl: orgDetails?.websiteUrl,
        },
        feedback: feedbackWithVoteStatus,
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: Math.ceil(totalCount / limit)
        }
      },
      { headers }
    );
    
  } catch (error) {
    logger.error('Error retrieving feedback', { 
      error: error instanceof Error ? error.message : String(error),
      organizationId,
      origin
    });
    
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to retrieve feedback' },
      { status: 500, headers }
    );
  }
}
