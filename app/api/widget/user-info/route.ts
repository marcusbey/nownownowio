import { verifyWidgetToken } from '@/lib/now-widget';
import { prisma } from '@/lib/prisma';
import { getUserDataSelect } from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server';

export async function OPTIONS(req: NextRequest) {
    const origin = req.headers.get('origin') || '*';

    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Methods': 'GET,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400',
        },
    });
}

export async function GET(req: NextRequest) {
    const origin = req.headers.get('origin') || '*';

    const headers = {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
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
            select: getUserDataSelect(userId),
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404, headers }
            );
        }

        return NextResponse.json(
            { user },
            { headers }
        );
    } catch (error) {
        console.error('Error fetching user info:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500, headers }
        );
    }
}
