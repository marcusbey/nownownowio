import { verifyWidgetToken, validateWidgetOrigin, getWidgetCorsHeaders } from '@/lib/now-widget';
import { prisma } from '@/lib/prisma';
import { feedbackExtensions } from '@/lib/prisma/prisma.feedback.extends';
import { Prisma } from '@prisma/client';
import { logger } from '@/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Define types for organization and plan data
type OrganizationPlanDetails = {
  websiteUrl: string | null;
  plan: {
    hasFeedbackFeature: boolean;
    maxFeedbackItems: number;
  } | null;
}

// Schema for validating feedback submission
const feedbackSchema = z.object({
  content: z.string().min(1).max(1000),
  email: z.string().email().optional().nullable(),
  organizationId: z.string().min(1)
});

// Schema for validating vote submission
const voteSchema = z.object({
  feedbackId: z.string().min(1),
  organizationId: z.string().min(1)
});

export async function OPTIONS(req: NextRequest, { params }: { params: Promise<Record<string, string>> }) {
  // Properly await params in Next.js 15, even though we're not using any params in this route
  await params;
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
 * POST handler for submitting new feedback
 */
export async function POST(req: NextRequest, { params }: { params: Promise<Record<string, string>> }) {
  // Properly await params in Next.js 15, even though we're not using any params in this route
  await params;
  const origin = req.headers.get('origin') ?? '*';
  const headers = getWidgetCorsHeaders(origin);
  const token = req.headers.get('Authorization')?.split(' ')[1];
  
  try {
    // Parse request body
    const body = await req.json();
    
    // Validate required fields
    const { content, email, organizationId } = feedbackSchema.parse(body);
    
    // Verify the widget token
    if (!token) {
      logger.warn('Missing authorization token for feedback submission', { organizationId, origin });
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authorization token is required' },
        { status: 401, headers }
      );
    }
    
    const isTokenValid = verifyWidgetToken(token, organizationId);
    if (!isTokenValid) {
      logger.warn('Invalid widget token for feedback submission', { organizationId, origin });
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or expired token' },
        { status: 401, headers }
      );
    }
    
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
        logger.warn('Invalid origin for feedback submission', { 
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
    
    // Check if the organization's plan allows feedback feature
    if (!orgDetails?.plan?.hasFeedbackFeature) {
      logger.warn('Organization plan does not include feedback feature', { 
        organizationId,
        origin
      });
      return NextResponse.json(
        { error: 'Forbidden', message: 'Feedback feature not available in your current plan' },
        { status: 403, headers }
      );
    }
    
    // Check if the organization has reached the maximum number of feedback items
    const feedbackCount = await prisma.widgetFeedback.countForOrganization(organizationId);
    
    const maxItems = orgDetails?.plan?.maxFeedbackItems ?? 0;
    if (feedbackCount >= maxItems) {
      logger.warn('Organization has reached maximum feedback items limit', { 
        organizationId, 
        feedbackCount,
        maxItems,
        origin
      });
      return NextResponse.json(
        { error: 'Limit Exceeded', message: 'You have reached the maximum number of feedback items for your plan' },
        { status: 403, headers }
      );
    }
    
    // Create the feedback using the extension method
    const feedbackResult = await prisma.$queryRaw<{
      id: string;
      content: string;
      email: string | null;
      votes: number;
      status: string;
      organizationId: string;
      createdAt: Date;
    }[]>`
      INSERT INTO "WidgetFeedback" ("content", "email", "organizationId", "votes", "status")
      VALUES (${content}, ${email}, ${organizationId}, 1, 'NEW')
      RETURNING *
    `;
    
    const feedback = feedbackResult[0];
    
    // Record the voter using their IP address
    const ipAddress = req.headers.get('x-forwarded-for') || 
                      req.headers.get('x-real-ip') || 
                      'unknown';
    
    const userAgent = req.headers.get('user-agent') || undefined;
    
    try {
      await prisma.widgetFeedbackVoter.create({
        data: {
          feedbackId: feedback.id,
          ipAddress: ipAddress.split(',')[0].trim(), // Use the first IP if multiple are provided
          userAgent: userAgent ?? undefined
        }
      });
    } catch (error) {
      logger.error('Error recording voter', {
        error: error instanceof Error ? error.message : String(error),
        feedbackId: feedback.id,
        ipAddress: ipAddress.split(',')[0].trim()
      });
      // Continue even if voter recording fails
    }
    
    logger.info('Feedback submitted successfully', { 
      organizationId, 
      feedbackId: feedback.id,
      origin
    });
    
    return NextResponse.json(
      { 
        success: true, 
        feedback: {
          id: feedback.id,
          content: feedback.content,
          votes: feedback.votes,
          createdAt: feedback.createdAt
        }
      },
      { headers }
    );
    
  } catch (error) {
    logger.error('Error processing feedback submission', { 
      error: error instanceof Error ? error.message : String(error),
      origin
    });
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation error', 
          message: 'Invalid feedback data', 
          details: error.errors 
        },
        { status: 400, headers }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to process feedback' },
      { status: 500, headers }
    );
  }
}

/**
 * PUT handler for voting on existing feedback
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<Record<string, string>> }) {
  // Properly await params in Next.js 15, even though we're not using any params in this route
  await params;
  const origin = req.headers.get('origin') ?? '*';
  const headers = getWidgetCorsHeaders(origin);
  const token = req.headers.get('Authorization')?.split(' ')[1];
  
  try {
    // Parse request body
    const body = await req.json();
    
    // Validate required fields
    const { feedbackId, organizationId } = voteSchema.parse(body);
    
    // Verify the widget token
    if (!token) {
      logger.warn('Missing authorization token for feedback vote', { organizationId, feedbackId, origin });
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authorization token is required' },
        { status: 401, headers }
      );
    }
    
    const isTokenValid = verifyWidgetToken(token, organizationId);
    if (!isTokenValid) {
      logger.warn('Invalid widget token for feedback vote', { organizationId, feedbackId, origin });
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or expired token' },
        { status: 401, headers }
      );
    }
    
    // Get the widget to validate the origin
    const widget = await prisma.widget.findFirst({
      where: { organizationId }
    });
    
    if (!widget) {
      logger.warn('Widget not found for organization', { organizationId, feedbackId, origin });
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
        logger.warn('Invalid origin for feedback vote', { 
          organizationId, 
          feedbackId,
          origin, 
          allowedDomain 
        });
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Invalid request origin' },
          { status: 403, headers }
        );
      }
    }
    
    // Check if the feedback exists and belongs to the organization
    const feedbackResult = await prisma.$queryRaw<{ id: string; content: string; votes: number; createdAt: Date }[]>`
      SELECT id, content, votes, "createdAt" FROM "WidgetFeedback"
      WHERE id = ${feedbackId} AND "organizationId" = ${organizationId}
      LIMIT 1
    `;
    
    if (feedbackResult.length === 0) {
      logger.warn('Feedback not found or does not belong to organization', { 
        organizationId, 
        feedbackId,
        origin
      });
      return NextResponse.json(
        { error: 'Not found', message: 'Feedback not found' },
        { status: 404, headers }
      );
    }
    
    // Get the voter's IP address
    const ipAddress = req.headers.get('x-forwarded-for') || 
                      req.headers.get('x-real-ip') || 
                      'unknown';
    
    const userAgent = req.headers.get('user-agent') || undefined;
    const voterIp = ipAddress.split(',')[0].trim(); // Use the first IP if multiple are provided
    
    // Check if the voter has already voted for this feedback
    const hasVoted = await prisma.widgetFeedbackVoter.hasVotedByIp(feedbackId, voterIp);
    
    if (hasVoted) {
      logger.info('Voter has already voted for this feedback', { 
        organizationId, 
        feedbackId,
        voterIp,
        origin
      });
      return NextResponse.json(
        { 
          success: false, 
          message: 'You have already voted for this feedback',
          feedback: {
            id: feedbackResult[0].id,
            content: feedbackResult[0].content,
            votes: feedbackResult[0].votes,
            createdAt: feedbackResult[0].createdAt
          }
        },
        { status: 409, headers }
      );
    }
    
    // Record the vote using a transaction function
    await prisma.$transaction(async (tx) => {
      // Increment the vote count
      await tx.widgetFeedback.update({
        where: { id: feedbackId },
        data: { votes: { increment: 1 } }
      });
      
      // Record the voter
      await tx.widgetFeedbackVoter.create({
        data: {
          feedbackId,
          ipAddress: voterIp,
          userAgent
        }
      });
    });
    
    // Get the updated feedback
    const updatedFeedbackResult = await prisma.$queryRaw<{ id: string; content: string; votes: number; createdAt: Date }[]>`
      SELECT id, content, votes, "createdAt" FROM "WidgetFeedback"
      WHERE id = ${feedbackId}
      LIMIT 1
    `;
    
    const updatedFeedback = updatedFeedbackResult[0];
    
    logger.info('Vote recorded successfully', { 
      organizationId, 
      feedbackId,
      votes: updatedFeedback.votes,
      origin
    });
    
    return NextResponse.json(
      { 
        success: true, 
        feedback: {
          id: updatedFeedback.id,
          content: updatedFeedback.content,
          votes: updatedFeedback.votes,
          createdAt: updatedFeedback.createdAt
        }
      },
      { headers }
    );
    
  } catch (error) {
    logger.error('Error processing feedback vote', { 
      error: error instanceof Error ? error.message : String(error),
      origin
    });
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation error', 
          message: 'Invalid vote data', 
          details: error.errors 
        },
        { status: 400, headers }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to process vote' },
      { status: 500, headers }
    );
  }
}

/**
 * GET handler for retrieving feedback for an organization
 */
export async function GET(req: NextRequest) {
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
    const ipAddress = req.headers.get('x-forwarded-for') || 
                      req.headers.get('x-real-ip') || 
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
