import { getClientIp } from "@/lib/api/ip";
import { getPostViewCount, queuePostView } from "@/lib/api/view-tracker";
import { logger } from "@/lib/logger";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Generate a random viewer ID for anonymous users
 */
function generateViewerId(): string {
    return `anon-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

type PostIdParams = {
    params: {
        postId: string;
    };
}

/**
 * Gets the view count for a post
 */
export async function GET(request: NextRequest, { params }: PostIdParams) {
    const { postId } = params;

    try {
        // Get the view count for the post
        const viewCount = await getPostViewCount(postId);

        return NextResponse.json(
            { views: viewCount },
            { status: 200 }
        );
    } catch (error) {
        logger.error("Error getting post view count:", {
            error: error instanceof Error ? error.message : String(error),
            postId
        });

        return NextResponse.json(
            {
                error: "Failed to get view count",
            },
            {
                status: 500
            }
        );
    }
}

/**
 * Tracks a view for a post and returns a success response
 */
export async function POST(request: NextRequest, { params }: PostIdParams) {
    const { postId } = params;

    try {
        // Extract the client IP address
        const clientIp = getClientIp(request) ?? "unknown";

        // Generate a unique viewer ID if not provided
        const headers = new Headers(request.headers);
        const viewerId = headers.get("x-viewer-id") ?? generateViewerId();

        // Set the viewer ID in the response headers for future requests
        headers.set("x-viewer-id", viewerId);

        // Queue the view for batch processing
        queuePostView(postId, viewerId, clientIp);

        // Return success immediately without waiting for DB operations
        return NextResponse.json(
            { success: true, postId, viewerId },
            {
                status: 202, // Accepted
                headers
            }
        );
    } catch (error) {
        logger.error("Error tracking post view:", {
            error: error instanceof Error ? error.message : String(error),
            postId
        });

        return NextResponse.json(
            {
                success: false,
                error: "Failed to track view",
            },
            {
                status: 500
            }
        );
    }
} 