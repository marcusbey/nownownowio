import { formatTimeAgo } from '@/lib/format/date';
import { logger } from '@/lib/logger';
import { getWidgetCorsHeaders, validateWidgetOrigin, verifyWidgetToken } from '@/lib/now-widget';
import { prisma } from '@/lib/prisma';
import { widgetExtensions } from '@/lib/prisma/prisma.widget.extends';
import { type NextRequest, NextResponse } from 'next/server';

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


export async function GET(req: NextRequest) {
    const origin = req.headers.get('origin') ?? '*';
    const headers = getWidgetCorsHeaders(origin);

    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get('orgId');
    const token = req.headers.get('Authorization')?.split(' ')[1];
    const includeComments = searchParams.get('includeComments') === 'true';

    // Log the incoming request
    logger.info('Widget org-posts request received', {
        orgId,
        origin,
        hasToken: !!token,
        includeComments
    });

    if (!orgId || !token) {
        logger.warn('Missing required parameters', { orgId, hasToken: !!token });
        return NextResponse.json(
            { error: 'Invalid request', message: 'Organization ID and token are required' },
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

    // Get the widget to validate the origin
    const widget = await widgetExtensions.findLatestForOrganization(orgId);
    if (!widget) {
        logger.warn('Widget not found for organization', { orgId, origin });
        return NextResponse.json(
            { error: 'Widget not configured', message: 'No widget found for this organization' },
            { status: 404, headers }
        );
    }

    // Get the organization details to extract the website URL
    const orgDetails = await prisma.organization.findUnique({
        where: { id: orgId },
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
                orgId,
                websiteUrl: orgDetails.websiteUrl,
                error
            });
        }
    }

    // Validate the request origin
    if (allowedDomain && origin !== '*') {
        const isOriginValid = validateWidgetOrigin(origin, allowedDomain);
        if (!isOriginValid) {
            logger.warn('Invalid origin for widget request', {
                orgId,
                origin,
                allowedDomain
            });
            return NextResponse.json(
                { error: 'Unauthorized', message: 'Invalid request origin' },
                { status: 403, headers }
            );
        }
    }

    try {
        // Find organization members to get their posts
        const members = await prisma.organizationMembership.findMany({
            where: { organizationId: orgId },
            select: { userId: true }
        });

        const memberIds = members.map(member => member.userId);

        // Get only the plan type from the organization to determine post limits
        const orgPlan = await prisma.organization.findUnique({
            where: { id: orgId },
            select: {
                planId: true
            }
        });

        // Determine if the organization has a paid plan (BASIC or PRO)
        const planId = orgPlan?.planId ?? 'FREE';
        const isPaidPlan = planId.startsWith('BASIC') || planId.startsWith('PRO');

        // Only limit posts for free plans
        const postLimit = isPaidPlan ? undefined : 5;

        // Get the posts without comments first (always needed)
        const postData = await prisma.post.findMany({
            where: { userId: { in: memberIds } },
            orderBy: { createdAt: 'desc' },
            ...(postLimit ? { take: postLimit } : {}),
            include: {
                media: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        image: true
                    }
                },
            // In the include section around line 143
            _count: {
                select: {
                    comments: true,
                    bookmarks: true,
                    likes: true,
                    views: true  // Add this line to include view counts
                    }
                }
            }
        });

        // Format the base post data
        type FormattedPost = {
            id: string;
            content: string;
            createdAt: Date;
            formattedCreatedAt: string;
            userId: string;
            media: {
                id: string;
                url: string;
                type: string;
            }[];
            user: {
                id: string;
                name: string | null;
                displayName: string | null;
                image: string | null;
            };
            _count: {
                comments: number;
                bookmarks: number;
                likes: number;
                views: number;
            };
            comments: {
                id: string;
                content: string;
                createdAt: Date;
                user: {
                    id: string;
                    name: string | null;
                    displayName: string | null;
                    image: string | null;
                };
            }[];
        };

        const formattedPosts: FormattedPost[] = postData.map(post => ({
            id: post.id,
            content: post.content,
            createdAt: post.createdAt,
            formattedCreatedAt: formatTimeAgo(post.createdAt),
            userId: post.userId,
            media: post.media.map(m => ({
                id: m.id,
                url: m.url,
                type: m.type
            })),
            user: {
                id: post.user.id,
                name: post.user.name,
                displayName: post.user.displayName,
                image: post.user.image
            },
            _count: {
                comments: post._count.comments,
                bookmarks: post._count.bookmarks,
                likes: post._count.likes,
                views: post._count.views || 0
            },
            comments: [] // Default empty array for comments
        }));

        // If comments are requested, fetch them in a separate query
        if (includeComments && formattedPosts.length > 0) {
            const postIds = formattedPosts.map(post => post.id);

            // Get comments for all posts
            const commentsData = await prisma.comment.findMany({
                where: { postId: { in: postIds } },
                orderBy: { createdAt: 'asc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            displayName: true,
                            image: true
                        }
                    }
                }
            });

            // Create a map of postId to comments
            type CommentMap = Record<string, {
                id: string;
                content: string;
                createdAt: Date;
                user: {
                    id: string;
                    name: string | null;
                    displayName: string | null;
                    image: string | null;
                };
            }[]>;

            const commentsByPostId = commentsData.reduce<CommentMap>((map, comment) => {
                const postId = comment.postId;

                if (!map[postId]) {
                    map[postId] = [];
                }

                map[postId].push({
                    id: comment.id,
                    content: comment.content,
                    createdAt: comment.createdAt,
                    user: {
                        id: comment.user.id,
                        name: comment.user.name,
                        displayName: comment.user.displayName,
                        image: comment.user.image
                    }
                });

                return map;
            }, {});

            // Add comments to each post
            formattedPosts.forEach(post => {
                const postComments = commentsByPostId[post.id];
                if (postComments) {
                    // Take only the first 3 comments
                    post.comments = postComments.slice(0, 3);
                }
            });
        }

        // Log successful request
        logger.info('Widget org-posts request successful', {
            orgId,
            origin,
            postsCount: formattedPosts.length,
            includeComments
        });

        return NextResponse.json(
            { posts: formattedPosts },
            { headers }
        );
    } catch (error) {
        logger.error('Error fetching posts', {
            orgId,
            origin,
            error: error instanceof Error ? error.message : String(error)
        });

        return NextResponse.json(
            { error: 'Internal server error', message: 'Failed to fetch organization posts' },
            { status: 500, headers }
        );
    }
}