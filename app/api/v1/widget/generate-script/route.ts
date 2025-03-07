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
    try {
        // Parse the request body
        let orgSlug: string;
        let settings: WidgetSettings;
        
        try {
            const body = await request.json() as { 
                orgSlug: string; 
                settings: WidgetSettings;
            };
            orgSlug = body.orgSlug;
            settings = body.settings;
        } catch (parseError) {
            console.error('Error parsing request body:', parseError);
            return NextResponse.json({ 
                error: 'Invalid request format', 
                message: 'Could not parse the request body as JSON.'
            }, { status: 400 });
        }

        if (!orgSlug || typeof orgSlug !== 'string') {
            return NextResponse.json({ error: 'Invalid organization slug' }, { status: 400 });
        }

        // Find the organization
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
        
        // Store the widget token for this user
        try {
            // Generate the widget token
            const token = generateWidgetToken(userId);
            
            // Update the user with the token
            await prisma.user.update({
                where: { id: userId },
                data: {
                    widgetToken: token,
                    // Also store the website URL if needed
                    websiteUrl: org.websiteUrl
                }
            });
            
            return generateWidgetScript(userId, token, domain, settings);
        } catch (dbError) {
            console.error('Error updating user widget token');
            if (dbError instanceof Error) {
                console.error('Error message:', dbError.message);
            }
            return NextResponse.json({ 
                error: 'Database error', 
                message: 'Failed to update user widget settings.'
            }, { status: 500 });
        }

// Helper function to generate the widget script
function generateWidgetScript(userId: string, token: string, domain: string, settings?: WidgetSettings) {
    if (!process.env.NEXT_PUBLIC_WIDGET_URL) {
        return NextResponse.json({ 
            error: 'Configuration error', 
            message: 'Widget URL configuration is missing.'
        }, { status: 500 });
    }

    // Build the script tag with attributes
    const scriptAttributes = [
        `data-user-id="${userId}"`,
        `data-token="${token}"`,
        `data-theme="${settings?.theme || 'dark'}"`,
        `data-position="${settings?.position || 'left'}"`,
        `data-button-color="${settings?.buttonColor || '#1a73e8'}"`,
        `data-button-size="${settings?.buttonSize || '90'}"`,
    ].join(' ');

    const script = `<script defer src="${process.env.NEXT_PUBLIC_WIDGET_URL}/now-widget.js" ${scriptAttributes}></script>`;

    // Return the successful response
    return NextResponse.json({
        script,
        token,
        allowedDomain: domain
    });
}
    } catch (error) {
        // Handle any unexpected errors
        console.error('Error generating widget script');
        if (error instanceof Error) {
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
        }
        return NextResponse.json({ 
            error: 'Server error', 
            message: 'An unexpected error occurred while generating the widget script.'
        }, { status: 500 });
    }
}