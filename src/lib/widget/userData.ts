import cors, { runMiddleware } from '@/lib/cors';
import { prisma } from '@/lib/prisma';
import { runRateLimit } from '@/lib/rateLimit';
import { verifyWidgetToken } from '@/lib/widget/widgetUtils';
import { NextApiRequest, NextApiResponse } from 'next';

async function getUserData(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { displayName: true, image: true },
    });

    const recentPosts = await prisma.post.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, content: true, createdAt: true },
    });

    return {
        user: user ? {
            displayName: user.displayName,
            avatarUrl: user.image
        } : null,
        recentPosts: recentPosts.map(post => ({
            id: post.id,
            content: post.content,
            createdAt: post.createdAt
        }))
    };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await runMiddleware(req, res, cors);
    await runRateLimit(req, res);

    const { userId } = req.query;
    const token = req.headers.authorization?.split(' ')[1];

    if (!userId || typeof userId !== 'string' || !token) {
        return res.status(400).json({ error: 'Invalid request' });
    }

    const isValid = verifyWidgetToken(token, userId);
    if (!isValid) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    if (req.method === 'GET') {
        try {
            const data = await getUserData(userId);
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error('Error fetching user data:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}