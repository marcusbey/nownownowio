import cors, { runMiddleware } from '@/lib/cors';
import { prisma } from '@/lib/prisma';
import { runRateLimit } from '@/lib/rateLimit';
import { verifyWidgetToken } from '@/lib/widget/widgetUtils';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await runMiddleware(req, res, cors);
    await runRateLimit(req, res);

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId } = req.query;
    const token = req.headers.authorization?.split(' ')[1];

    if (!userId || typeof userId !== 'string' || !token) {
        return res.status(400).json({ error: 'Invalid request' });
    }

    try {
        const isValid = verifyWidgetToken(token, userId);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const posts = await prisma.post.findMany({
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

        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}