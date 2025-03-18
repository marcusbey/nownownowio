import { verifyWidgetToken, validateWidgetOrigin, getWidgetCorsHeaders } from '@/lib/now-widget';
import { formatTimeAgo } from '@/lib/format/date';
import { prisma } from '@/lib/prisma';
import { widgetExtensions } from '@/lib/prisma/prisma.widget.extends';
import { logger } from '@/lib/logger';
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

    // Log the incoming request
    logger.info('Widget org-posts request received', { 
        orgId, 
        origin,
        hasToken: !!token 
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
        // Get organization members to fetch their posts
        const members = await prisma.organizationMembership.findMany({
            where: { organizationId: orgId },
            select: { userId: true }
        });
        
        const memberIds = members.map((member: { userId: string }) => member.userId);
        
        // Get only the plan type from the organization to determine post limits
        const orgPlan = await prisma.organization.findUnique({
            where: { id: orgId },
            select: {
                planId: true
            }
        });

        // Determine if the organization has a paid plan (BASIC or PRO)
        // FREE plans are limited to 5 posts, while BASIC and PRO plans have no limit
        const planId = orgPlan?.planId ?? 'FREE';
        const isPaidPlan = planId.startsWith('BASIC') || planId.startsWith('PRO');
        
        // Only limit posts for free plans
        const postLimit = isPaidPlan ? undefined : 5;
        
        const posts = await prisma.post.findMany({
            where: { userId: { in: memberIds } },
            orderBy: { createdAt: 'desc' },
            ...(postLimit ? { take: postLimit } : {}), // Only limit posts for free plans
            select: {
                id: true,
                content: true,
                createdAt: true,
                userId: true,
                media: {
                    select: {
                        id: true,
                        url: true,
                        type: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        image: true
                    }
                },
                _count: {
                    select: {
                        comments: true,
                        bookmarks: true,
                        likes: true,
                    },
                },
                comments: {
                    take: 3, // Limit to 3 most recent comments per post
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        content: true,
                        createdAt: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                displayName: true,
                                image: true
                            }
                        }
                    }
                },
            },
        });

        // Transform the posts to include a formatted createdAt time
        const formattedPosts = posts.map(post => ({
            ...post,
            formattedCreatedAt: formatTimeAgo(post.createdAt),
            // Sort comments to show oldest first (conversation order)
            comments: post.comments.sort((a, b) => 
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            )
        }));

        // Log successful request
        logger.info('Widget org-posts request successful', { 
            orgId,
            origin,
            postsCount: posts.length
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