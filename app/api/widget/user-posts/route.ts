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
                'Access-Control-Max-Age': '86400', // Cache preflight response for 1 day
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
        const posts = await prisma.post.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 5, // Limit to the latest 5 posts
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

        return NextResponse.json(
            { posts },
            { headers }
        );
    } catch (error) {
        console.error('Error fetching posts:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500, headers }
        );
    }
}