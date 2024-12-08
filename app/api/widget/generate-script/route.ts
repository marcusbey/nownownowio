import { generateWidgetToken } from '@/lib/now-widget';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { orgSlug, settings } = await request.json();

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

    if (!process.env.NEXT_PUBLIC_WIDGET_URL) {
        throw new Error('NEXT_PUBLIC_WIDGET_URL environment variable is not set');
    }

    const scriptAttributes = [
        `data-user-id="${userId}"`,
        `data-token="${token}"`,
        `data-theme="${settings?.theme || 'dark'}"`,
        `data-position="${settings?.position || 'left'}"`,
        `data-button-color="${settings?.buttonColor || '#1a73e8'}"`,
        `data-button-size="${settings?.buttonSize || '90'}"`,
    ].join(' ');

    const script = `<script defer src="${process.env.NEXT_PUBLIC_WIDGET_URL}/dist/now-widget.js" ${scriptAttributes}></script>`;

    return NextResponse.json({
        script,
        token
    });
}