import { verifyWidgetToken, validateWidgetOrigin, getWidgetCorsHeaders } from '@/lib/now-widget';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

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

/**
 * POST handler for submitting new feedback
 */
export async function POST(req: NextRequest) {
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
    
    // Get the organization details to extract the website URL
    const orgDetails = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        websiteUrl: true
      }
    });
    
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
    
    // Create the feedback
    const feedback = await prisma.widgetFeedback.create({
      data: {
        content,
        email,
        organizationId,
        votes: 1, // Start with 1 vote (the submitter)
      }
    });
    
    // Record the voter using their IP address
    const ipAddress = req.headers.get('x-forwarded-for') || 
                      req.headers.get('x-real-ip') || 
                      'unknown';
    
    const userAgent = req.headers.get('user-agent') || undefined;
    
    await prisma.widgetFeedbackVoter.create({
      data: {
        feedbackId: feedback.id,
        ipAddress: ipAddress.split(',')[0].trim(), // Use the first IP if multiple are provided
        userAgent
      }
    });
    
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
export async function PUT(req: NextRequest) {
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
    
    // Get the organization details to extract the website URL
    const orgDetails = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        websiteUrl: true
      }
    });
    
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
    const feedback = await prisma.widgetFeedback.findFirst({
      where: {
        id: feedbackId,
        organizationId
      }
    });
    
    if (!feedback) {
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
    const existingVote = await prisma.widgetFeedbackVoter.findFirst({
      where: {
        feedbackId,
        ipAddress: voterIp
      }
    });
    
    if (existingVote) {
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
            id: feedback.id,
            content: feedback.content,
            votes: feedback.votes,
            createdAt: feedback.createdAt
          }
        },
        { status: 409, headers }
      );
    }
    
    // Record the vote
    await prisma.$transaction([
      // Increment the vote count
      prisma.widgetFeedback.update({
        where: { id: feedbackId },
        data: { votes: { increment: 1 } }
      }),
      // Record the voter
      prisma.widgetFeedbackVoter.create({
        data: {
          feedbackId,
          ipAddress: voterIp,
          userAgent
        }
      })
    ]);
    
    // Get the updated feedback
    const updatedFeedback = await prisma.widgetFeedback.findUnique({
      where: { id: feedbackId }
    });
    
    logger.info('Vote recorded successfully', { 
      organizationId, 
      feedbackId,
      votes: updatedFeedback?.votes,
      origin
    });
    
    return NextResponse.json(
      { 
        success: true, 
        feedback: {
          id: updatedFeedback?.id,
          content: updatedFeedback?.content,
          votes: updatedFeedback?.votes,
          createdAt: updatedFeedback?.createdAt
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
    
    // Get the organization details to extract the website URL
    const orgDetails = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        websiteUrl: true
      }
    });
    
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
    const feedback = await prisma.widgetFeedback.findMany({
      where: { organizationId },
      orderBy: { votes: 'desc' },
      take: limit,
      skip,
      select: {
        id: true,
        content: true,
        votes: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            voters: true
          }
        }
      }
    });
    
    // Get the total count for pagination
    const totalCount = await prisma.widgetFeedback.count({
      where: { organizationId }
    });
    
    // Check if the user has voted for any of the feedback items
    const ipAddress = req.headers.get('x-forwarded-for') || 
                      req.headers.get('x-real-ip') || 
                      'unknown';
    const voterIp = ipAddress.split(',')[0].trim();
    
    const feedbackIds = feedback.map(f => f.id);
    
    const userVotes = await prisma.widgetFeedbackVoter.findMany({
      where: {
        feedbackId: { in: feedbackIds },
        ipAddress: voterIp
      },
      select: {
        feedbackId: true
      }
    });
    
    const userVotedFeedbackIds = new Set(userVotes.map(v => v.feedbackId));
    
    // Add hasVoted flag to each feedback item
    const feedbackWithVoteStatus = feedback.map(f => ({
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
