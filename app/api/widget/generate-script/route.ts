import { generateWidgetToken } from '@/lib/widget/widgetUtils';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { userId } = await request.json();

    if (!userId || typeof userId !== 'string') {
        return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
    }

    const token = generateWidgetToken(userId);

    return NextResponse.json({
        script: `<script src="${process.env.NEXT_PUBLIC_WIDGET_URL}/nownownow-widget-bundle.js" data-user-id="${userId}" data-token="${token}"></script>`,
        token
    });
}