import { verifyWidgetToken, validateWidgetOrigin, getWidgetCorsHeaders } from '@/lib/now-widget';
import { prisma } from '@/lib/prisma';
import { widgetExtensions } from '@/lib/prisma/prisma.widget.extends';
import { logger } from '@/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';

export async function OPTIONS(req: NextRequest) {
    // Get the origin from the request
    const origin = req.headers.get('origin');
    
    return new NextResponse(null, {
        status: 204,
        headers: getWidgetCorsHeaders(origin ?? undefined),
    });
}

export async function GET(req: NextRequest) {
    // Get the origin from the request
    const origin = req.headers.get('origin');
    const headers = getWidgetCorsHeaders(origin ?? undefined);

    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get('orgId');
    const token = req.headers.get('Authorization')?.split(' ')[1];

    if (!orgId || !token) {
        logger.warn('Widget org-info request missing required parameters', {
            hasOrgId: Boolean(orgId),
            hasToken: Boolean(token),
            origin
        });
        return NextResponse.json(
            { error: 'Invalid request', message: 'Organization ID and authorization token are required' },
            { status: 400, headers }
        );
    }

    try {
        // First, get the widget information to verify domain
        const widget = await widgetExtensions.findLatestForOrganization(orgId);
        
        // Get the organization details to extract the website URL
        const orgDetails = widget ? await prisma.organization.findUnique({
            where: { id: orgId },
            select: {
                id: true,
                name: true,
                image: true,
                bio: true,
                websiteUrl: true,
                members: {
                    where: { roles: { has: 'OWNER' } },
                    take: 1,
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                displayName: true,
                                email: true,
                                emailVerified: true,
                                image: true,
                                bio: true,
                                websiteUrl: true,
                                createdAt: true,
                                updatedAt: true
                            }
                        }
                    }
                }
            }
        }) : null;

        if (!widget) {
            logger.warn('Widget not found for organization', { orgId, origin });
            return NextResponse.json(
                { error: 'Widget not configured', message: 'No widget found for this organization' },
                { status: 404, headers }
            );
        }

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

        // Verify the widget token against the organization and origin
        // This now handles both token validation and origin validation in one step
        const isTokenValid = verifyWidgetToken(token, orgId, origin);
        if (!isTokenValid) {
            logger.warn('Invalid widget token or origin', { orgId, origin });
            return NextResponse.json(
                { error: 'Invalid token', message: 'The provided authorization token is invalid or the origin is not allowed' },
                { status: 401, headers }
            );
        }
        
        // Note: We no longer need the separate origin validation since it's included in verifyWidgetToken
        // But we'll keep a fallback validation for backward compatibility with existing tokens
        if (origin && allowedDomain && !origin.includes('localhost')) {
            const isOriginValid = validateWidgetOrigin(origin, allowedDomain);
            if (!isOriginValid) {
                logger.warn('Invalid widget origin (fallback check)', { 
                    orgId, 
                    origin,
                    allowedDomain 
                });
                return NextResponse.json(
                    { error: 'Invalid origin', message: 'This widget can only be used on the registered domain' },
                    { status: 403, headers }
                );
            }
        }

        if (!orgDetails || orgDetails.members.length === 0) {
            logger.warn('Organization or owner not found', { orgId });
            return NextResponse.json(
                { error: 'Organization not found', message: 'The organization or its owner could not be found' },
                { status: 404, headers }
            );
        }

        const owner = orgDetails.members[0].user;

        // Log successful request
        logger.info('Widget org-info request successful', { 
            orgId,
            origin,
            organizationName: orgDetails.name
        });

        return NextResponse.json(
            { 
                organization: {
                    id: orgDetails.id,
                    name: orgDetails.name,
                    image: orgDetails.image,
                    bio: orgDetails.bio,
                    websiteUrl: orgDetails.websiteUrl
                },
                user: owner 
            },
            { headers }
        );
    } catch (error) {
        logger.error('Error fetching organization info', { 
            error, 
            orgId,
            origin
        });
        
        return NextResponse.json(
            { error: 'Internal server error', message: 'An error occurred while fetching organization information' },
            { status: 500, headers }
        );
    }
}
