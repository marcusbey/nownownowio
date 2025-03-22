import { getPostViewCount } from "@/lib/api/view-tracker";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Schema for validating the request body
const batchStatsSchema = z.object({
    postIds: z.array(z.string()).min(1).max(50),
    stats: z.array(z.enum(["views", "likes", "comments"])).optional(),
});

export async function POST(request: NextRequest) {
    try {
        // Parse and validate the request body
        const body = await request.json();
        const result = batchStatsSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                {
                    error: "Invalid request body",
                    details: result.error.format()
                },
                { status: 400 }
            );
        }

        const { postIds, stats = ["views", "likes", "comments"] } = result.data;

        // Prepare the response data
        const response: Record<string, Record<string, number>> = {};

        // Process each post ID
        await Promise.all(postIds.map(async (postId) => {
            response[postId] = {};

            // Get views if requested
            if (stats.includes("views")) {
                try {
                    const viewCount = await getPostViewCount(postId);
                    response[postId].views = viewCount;
                } catch (error) {
                    logger.error(`Error fetching views for post ${postId}:`, {
                        error: error instanceof Error ? error.message : String(error)
                    });
                    response[postId].views = 0;
                }
            }

            // Get likes if requested
            if (stats.includes("likes")) {
                try {
                    const likeCount = await prisma.postLike.count({
                        where: { postId }
                    });
                    response[postId].likes = likeCount;
                } catch (error) {
                    logger.error(`Error fetching likes for post ${postId}:`, {
                        error: error instanceof Error ? error.message : String(error)
                    });
                    response[postId].likes = 0;
                }
            }

            // Get comments if requested
            if (stats.includes("comments")) {
                try {
                    const commentCount = await prisma.comment.count({
                        where: { postId }
                    });
                    response[postId].comments = commentCount;
                } catch (error) {
                    logger.error(`Error fetching comments for post ${postId}:`, {
                        error: error instanceof Error ? error.message : String(error)
                    });
                    response[postId].comments = 0;
                }
            }
        }));

        // Add HTTP cache headers
        const headers = new Headers();
        headers.set("Cache-Control", "public, max-age=60, s-maxage=300");

        return NextResponse.json(response, {
            status: 200,
            headers
        });
    } catch (error) {
        logger.error("Error in batch stats API:", {
            error: error instanceof Error ? error.message : String(error)
        });

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
} 