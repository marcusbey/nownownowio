import { verifyWidgetToken } from '@/lib/now-widget';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function OPTIONS(req: NextRequest) {
    const origin = req.headers.get('origin');

    if (origin) {
        return new NextResponse(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': origin,
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '86400', // Optional: Cache preflight response for 1 day
            },
        });
    }

    return new NextResponse(null, { status: 403 });
}

export async function GET(req: NextRequest) {
    const origin = req.headers.get('origin');

    if (!origin) {
        return new NextResponse(null, { status: 403 });
    }

    const headers = {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const token = req.headers.get('Authorization')?.split(' ')[1];

    if (!userId || !token) {
        return NextResponse.json(
            { error: 'Invalid request' },
            { status: 400, headers }
        );
    }

    const isValid = verifyWidgetToken(token, userId);
    if (!isValid) {
        return NextResponse.json(
            { error: 'Invalid token' },
            { status: 401, headers }
        );
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                name: true,
                displayName: true,
                image: true,
                bio: true,
            },
        });

        const recentPosts = await prisma.post.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
                id: true,
                content: true,
                createdAt: true,
                _count: {
                    select: {
                        comments: true,
                        bookmarks: true,
                        likes: true,
                    },
                },
            },
        });

        const data = {
            user: user
                ? {
                    name: user.name,
                    displayName: user.displayName,
                    image: user.image,
                    bio: user.bio,
                }
                : null,
            recentPosts: recentPosts.map((post) => ({
                id: post.id,
                content: post.content,
                createdAt: post.createdAt,
                _count: post._count,
            })),
        };

        return NextResponse.json(
            { success: true, data },
            { headers }
        );
    } catch (error) {
        console.error('Error fetching user data:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500, headers }
        );
    }
}