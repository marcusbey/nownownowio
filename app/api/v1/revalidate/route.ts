import { requiredAuth } from "@/lib/auth/helper";
import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        // Check authentication - only allow authenticated users
        await requiredAuth();

        // Parse the request body to get tags to revalidate
        const { tags = ['posts'] } = await request.json();

        if (!Array.isArray(tags)) {
            return NextResponse.json(
                { error: 'Tags must be an array' },
                { status: 400 }
            );
        }

        // Revalidate each provided tag
        tags.forEach(tag => {
            if (typeof tag === 'string' && tag.trim()) {
                revalidateTag(tag.trim());
            }
        });

        return NextResponse.json({
            revalidated: true,
            message: `Revalidated tags: ${tags.join(', ')}`,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error revalidating:', error);

        return NextResponse.json(
            {
                revalidated: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
} 