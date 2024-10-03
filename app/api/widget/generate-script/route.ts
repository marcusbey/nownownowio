import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { generateWidgetToken } from 'now-widget/widget/widgetUtils';

export async function POST(request: Request) {
    const { orgSlug } = await request.json();

    if (!orgSlug || typeof orgSlug !== 'string') {
        return NextResponse.json({ error: 'Invalid organization slug' }, { status: 400 });
    }

    const org = await prisma.organization.findUnique({
        where: { slug: orgSlug },
        include: { members: { where: { roles: { has: 'OWNER' } }, take: 1 } }
    });

    if (!org || org.members.length === 0) {
        return NextResponse.json({ error: 'Organization or owner not found' }, { status: 404 });
    }

    const userId = org.members[0].userId;
    const token = generateWidgetToken(userId);

    return NextResponse.json({
        script: `<script src="${process.env.NEXT_PUBLIC_WIDGET_URL}/now-bundle.js" data-user-id="${userId}" data-token="${token}"></script>`,
        token
    });
}