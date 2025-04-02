import { logger } from '@/lib/logger';
import { getWidgetCorsHeaders, verifyWidgetToken } from '@/lib/now-widget';
import { prisma } from '@/lib/prisma';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema for request validation
const requestSchema = z.object({
    postId: z.string().trim().min(1, "Post ID is required"),
    cursor: z.string().optional(),
    limit: z.number().int().min(1).max(50).optional().default(10)
});

// Set dynamic to handle fresh requests
export const dynamic = 'force-dynamic';

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(req: NextRequest) {
    const origin = req.headers.get('origin');

    return new NextResponse(null, {
        status: 204,
        headers: getWidgetCorsHeaders(origin ?? undefined),
    });
}

// Handle POST requests to fetch comments
export async function POST(req: NextRequest) {
    const origin = req.headers.get('origin');
    const headers = getWidgetCorsHeaders(origin ?? undefined);

    // Extract authorization token
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ')
        ? authHeader.substring(7)
        : null;

    if (!token) {
        logger.warn('Widget post-comments request missing authorization token', { origin });
        return NextResponse.json(
            {
                success: false,
                error: 'Authentication required'
            },
            { status: 401, headers }
        );
    }

    try {
        // Parse request body
        const body = await req.json();

        // Validate request body
        const validation = requestSchema.safeParse(body);
        if (!validation.success) {
            logger.warn('Widget post-comments request has invalid body', {
                errors: validation.error.format(),
                origin
            });
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid request format',
                },
                { status: 400, headers }
            );
        }

        const { postId, cursor, limit } = validation.data;

        // Find the post to get the organization ID
        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: {
                id: true,
                organizationId: true
            }
        });

        if (!post) {
            logger.warn('Widget post-comments request for non-existent post', { postId, origin });
            return NextResponse.json(
                {
                    success: false,
                    error: 'Post not found'
                },
                { status: 404, headers }
            );
        }

        // Verify the token against the organization ID
        const isTokenValid = post.organizationId
            ? verifyWidgetToken(token, post.organizationId, origin)
            : false;

        if (!isTokenValid) {
            logger.warn('Widget post-comments request has invalid token', {
                postId,
                origin,
                hasOrgId: !!post.organizationId
            });
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid or expired token'
                },
                { status: 401, headers }
            );
        }

        // Set up pagination
        const take = limit + 1; // Take one extra to determine if there are more comments

        // Fetch comments for the post with pagination
        const comments = await prisma.comment.findMany({
            where: { postId },
            orderBy: { createdAt: 'asc' },
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}), // Skip cursor if provided
            take,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                }
            }
        });

        // Check if there are more comments
        const hasMore = comments.length > limit;
        const nextCursor = hasMore ? comments[limit - 1].id : undefined;

        // Format the response data
        const formattedComments = comments
            .slice(0, limit) // Remove the extra item we fetched
            .map(comment => ({
                id: comment.id,
                content: comment.content,
                createdAt: comment.createdAt,
                user: {
                    id: comment.user.id,
                    name: comment.user.name,
                    image: comment.user.image
                }
            }));

        // Log successful request
        logger.info('Widget post-comments request successful', {
            postId,
            origin,
            commentCount: formattedComments.length,
            hasMore
        });

        // Return the comments in the specified format
        return NextResponse.json(
            {
                success: true,
                data: formattedComments,
                pagination: {
                    hasMore,
                    nextCursor
                }
            },
            { headers }
        );
    } catch (error) {
        logger.error('Error processing widget post-comments request', {
            error: error instanceof Error ? error.message : String(error),
            origin
        });

        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error'
            },
            { status: 500, headers }
        );
    }
} 