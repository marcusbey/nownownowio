import { generateWidgetToken } from '@/lib/now-widget';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

type WidgetSettings = {
  theme: string;
  position: string;
  buttonColor: string;
  buttonSize: number;
};

export async function POST(request: Request) {
    const { orgSlug, settings } = await request.json() as { 
        orgSlug: string; 
        settings: WidgetSettings;
    };

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

    // Check if organization has a website URL
    if (!org.websiteUrl) {
        return NextResponse.json({ 
            error: 'Missing website URL', 
            message: 'Please add a website URL in your organization settings before generating a widget script.'
        }, { status: 400 });
    }

    // Extract domain from website URL
    let domain: string;
    try {
        domain = new URL(org.websiteUrl).hostname;
    } catch (error) {
        return NextResponse.json({ 
            error: 'Invalid website URL', 
            message: 'The website URL in your organization settings is invalid.'
        }, { status: 400 });
    }

    const userId = org.members[0].userId;
    
    // Store the allowed domain for this user
    await prisma.user.update({
        where: { id: userId },
        data: {
            widgetDomains: {
                set: [domain]
            }
        }
    });

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

    const script = `<script defer src="${process.env.NEXT_PUBLIC_WIDGET_URL}/now-widget.js" ${scriptAttributes}></script>`;

    return NextResponse.json({
        script,
        token,
        allowedDomain: domain
    });
}