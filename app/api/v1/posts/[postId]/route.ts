import { auth } from "@/lib/auth/helper";
import { prisma } from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function GET(
    request: Request,
    context: { params: Promise<{ postId: string }> }
) {
    // --- ENHANCED CACHING STRATEGY ---
    // Define cache headers for more aggressive caching
    const headers = {
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=120', // Cache for 30s, revalidate for 2 mins
        'CDN-Cache-Control': 'public, s-maxage=60', // CDN cache for 1 min
        'Vercel-CDN-Cache-Control': 'public, s-maxage=60' // Vercel specific
    };

    try {
        const user = await auth();
        const { postId } = await context.params;

        if (!postId) {
            return NextResponse.json(
                { error: "Post ID is required" },
                { status: 400, headers }
            );
        }

        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: getPostDataInclude(user?.id || ""),
        });

        if (!post) {
            return NextResponse.json(
                { error: "Post not found" },
                { status: 404, headers }
            );
        }

        return NextResponse.json(post, { headers });
    } catch (error) {
        console.error("[GET_POST_BY_ID]", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers }
        );
    }
}

export async function DELETE(
    request: Request,
    context: { params: Promise<{ postId: string }> }
) {
    try {
        const user = await auth();
        if (!user) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const { postId } = await context.params;

        // Check if post exists and belongs to the user
        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { userId: true },
        });

        if (!post) {
            return NextResponse.json(
                { error: "Post not found" },
                { status: 404 }
            );
        }

        if (post.userId !== user.id) {
            return NextResponse.json(
                { error: "You can only delete your own posts" },
                { status: 403 }
            );
        }

        // Delete the post
        const deletedPost = await prisma.post.delete({
            where: { id: postId },
            include: getPostDataInclude(user.id),
        });

        return NextResponse.json(deletedPost);
    } catch (error) {
        console.error("[DELETE_POST]", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
} 