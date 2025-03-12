import { verifyWidgetToken } from '@/lib/now-widget';
import { prisma } from '@/lib/prisma';
import { getUserDataSelect } from '@/lib/types';
import { type NextRequest, NextResponse } from 'next/server';

export async function OPTIONS(_req: NextRequest) {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400',
        },
    });
}

export async function GET(req: NextRequest) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get('orgId');
    const token = req.headers.get('Authorization')?.split(' ')[1];

    if (!orgId || !token) {
        return NextResponse.json(
            { error: 'Invalid request' },
            { status: 400, headers }
        );
    }

    // Verify the widget token against the organization
    const isValid = verifyWidgetToken(token, orgId);
    if (!isValid) {
        return NextResponse.json(
            { error: 'Invalid token' },
            { status: 401, headers }
        );
    }

    try {
        // Find the organization and its owner
        const organization = await prisma.organization.findUnique({
            where: { id: orgId },
            include: {
                members: {
                    where: { roles: { has: 'OWNER' } },
                    take: 1,
                    include: {
                        user: {
                            select: getUserDataSelect(''),
                        }
                    }
                }
            }
        });

        if (!organization || organization.members.length === 0) {
            return NextResponse.json(
                { error: 'Organization not found' },
                { status: 404, headers }
            );
        }

        const owner = organization.members[0].user;

        return NextResponse.json(
            { 
                organization: {
                    id: organization.id,
                    name: organization.name,
                    image: organization.image
                },
                user: owner 
            },
            { headers }
        );
    } catch (error) {
        // Log error but avoid console statement in production
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching user info:', error);
        }
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500, headers }
        );
    }
}
