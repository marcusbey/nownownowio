import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import type { FeedbackStatus } from '@prisma/client';


// Validate the update feedback request
const updateFeedbackSchema = z.object({
  status: z.enum(['NEW', 'ACKNOWLEDGED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'])
});

/**
 * GET handler for retrieving feedback for an organization
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const session = await auth();
  const { orgId } = await params;

  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'You must be logged in to access this resource' },
      { status: 401 }
    );
  }

  try {
    // Check if the user is a member of the organization
    const membership = await prisma.organizationMembership.findFirst({
      where: {
        organizationId: orgId,
        userId: session.user.id,
      },
    });

    if (!membership) {
      logger.warn('Unauthorized access attempt to organization feedback', {
        userId: session.user.id,
        organizationId: orgId,
      });
      
      return NextResponse.json(
        { error: 'Forbidden', message: 'You do not have access to this organization' },
        { status: 403 }
      );
    }

    // Get pagination parameters from query string
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') ?? '10', 10);
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const status = searchParams.get('status') as FeedbackStatus | null;
    const skip = (page - 1) * limit;

    // Build the where clause for filtering
    const where: any = { organizationId: orgId };
    if (status) {
      where.status = status;
    }

    // Get the feedback for the organization
    const feedback = await prisma.widgetFeedback.findMany({
      where,
      orderBy: [
        { status: 'asc' },
        { votes: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit,
      skip,
      select: {
        id: true,
        content: true,
        email: true,
        votes: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            voters: true
          }
        }
      }
    });

    // Get the total count for pagination
    const totalCount = await prisma.widgetFeedback.count({
      where
    });

    logger.info('Organization feedback retrieved successfully', {
      userId: session.user.id,
      organizationId: orgId,
      count: feedback.length,
      totalCount
    });

    return NextResponse.json({
      feedback,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    logger.error('Error retrieving organization feedback', {
      error: error instanceof Error ? error.message : String(error),
      userId: session.user.id,
      organizationId: orgId
    });

    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to retrieve feedback' },
      { status: 500 }
    );
  }
}

/**
 * PUT handler for updating feedback status
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const session = await auth();
  const { orgId } = await params;

  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'You must be logged in to access this resource' },
      { status: 401 }
    );
  }

  try {
    // Check if the user is a member of the organization with admin or owner role
    const membership = await prisma.organizationMembership.findFirst({
      where: {
        organizationId: orgId,
        userId: session.user.id,
        roles: {
          hasSome: ['ADMIN', 'OWNER']
        }
      },
    });

    if (!membership) {
      logger.warn('Unauthorized attempt to update organization feedback', {
        userId: session.user.id,
        organizationId: orgId,
      });
      
      return NextResponse.json(
        { error: 'Forbidden', message: 'You do not have permission to update feedback' },
        { status: 403 }
      );
    }

    // Parse and validate the request body
    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const feedbackId = searchParams.get('feedbackId');

    if (!feedbackId) {
      return NextResponse.json(
        { error: 'Bad request', message: 'Feedback ID is required' },
        { status: 400 }
      );
    }

    // Validate the update data
    const { status } = updateFeedbackSchema.parse(body);

    // Check if the feedback exists and belongs to the organization
    const feedback = await prisma.widgetFeedback.findFirst({
      where: {
        id: feedbackId,
        organizationId: orgId
      }
    });

    if (!feedback) {
      logger.warn('Feedback not found or does not belong to organization', {
        userId: session.user.id,
        organizationId: orgId,
        feedbackId
      });
      
      return NextResponse.json(
        { error: 'Not found', message: 'Feedback not found' },
        { status: 404 }
      );
    }

    // Update the feedback status
    const updatedFeedback = await prisma.widgetFeedback.update({
      where: { id: feedbackId },
      data: { status: status as FeedbackStatus }
    });

    logger.info('Feedback status updated successfully', {
      userId: session.user.id,
      organizationId: orgId,
      feedbackId,
      oldStatus: feedback.status,
      newStatus: status
    });

    return NextResponse.json({
      success: true,
      feedback: updatedFeedback
    });
  } catch (error) {
    logger.error('Error updating feedback status', {
      error: error instanceof Error ? error.message : String(error),
      userId: session.user.id,
      organizationId: orgId
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'Invalid status value',
          details: error.errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to update feedback status' },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler for removing feedback
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const session = await auth();
  const { orgId } = await params;

  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'You must be logged in to access this resource' },
      { status: 401 }
    );
  }

  try {
    // Check if the user is a member of the organization with admin or owner role
    const membership = await prisma.organizationMembership.findFirst({
      where: {
        organizationId: orgId,
        userId: session.user.id,
        roles: {
          hasSome: ['ADMIN', 'OWNER']
        }
      },
    });

    if (!membership) {
      logger.warn('Unauthorized attempt to delete organization feedback', {
        userId: session.user.id,
        organizationId: orgId,
      });
      
      return NextResponse.json(
        { error: 'Forbidden', message: 'You do not have permission to delete feedback' },
        { status: 403 }
      );
    }

    // Get the feedback ID from query params
    const { searchParams } = new URL(req.url);
    const feedbackId = searchParams.get('feedbackId');

    if (!feedbackId) {
      return NextResponse.json(
        { error: 'Bad request', message: 'Feedback ID is required' },
        { status: 400 }
      );
    }

    // Check if the feedback exists and belongs to the organization
    const feedback = await prisma.widgetFeedback.findFirst({
      where: {
        id: feedbackId,
        organizationId: orgId
      }
    });

    if (!feedback) {
      logger.warn('Feedback not found or does not belong to organization', {
        userId: session.user.id,
        organizationId: orgId,
        feedbackId
      });
      
      return NextResponse.json(
        { error: 'Not found', message: 'Feedback not found' },
        { status: 404 }
      );
    }

    // Delete the feedback and all associated voters
    await prisma.$transaction([
      prisma.widgetFeedbackVoter.deleteMany({
        where: { feedbackId }
      }),
      prisma.widgetFeedback.delete({
        where: { id: feedbackId }
      })
    ]);

    logger.info('Feedback deleted successfully', {
      userId: session.user.id,
      organizationId: orgId,
      feedbackId
    });

    return NextResponse.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting feedback', {
      error: error instanceof Error ? error.message : String(error),
      userId: session.user.id,
      organizationId: orgId
    });

    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to delete feedback' },
      { status: 500 }
    );
  }
}
