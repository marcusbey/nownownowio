import { verifyWidgetToken, validateWidgetOrigin, getWidgetCorsHeaders } from '@/lib/now-widget';
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
        const members = await prisma.organizationMembership.findMany({
            where: { organizationId: orgId },
            select: { userId: true }
        });
        
        const memberIds = members.map((member: { userId: string }) => member.userId);
        
        const posts = await prisma.post.findMany({
            where: { userId: { in: memberIds } },
            orderBy: { createdAt: 'desc' },
            take: 5, // Limit to the latest 5 posts
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
            },
        });

        // Log successful request
        logger.info('Widget org-posts request successful', { 
            orgId,
            origin,
            postsCount: posts.length
        });

        return NextResponse.json(
            { posts },
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