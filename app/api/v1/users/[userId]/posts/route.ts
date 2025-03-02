import { baseAuth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Authentication
    const session = await baseAuth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to view user posts" },
        { status: 401 }
      );
    }

    // Await params before using its properties
    const awaitedParams = await params;
    const userId = awaitedParams.userId;
    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get("cursor");
    const limit = 10;

    // Verify user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!userExists) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get user posts with pagination
    const posts = await prisma.post.findMany({
      where: {
        userId: userId,
      },
      take: limit + 1, // Take one more to check if there are more posts
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            displayName: true,
            image: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
        likes: {
          where: {
            userId: session.user.id,
          },
          select: {
            id: true,
          },
        },
        bookmarks: {
          where: {
            userId: session.user.id,
          },
          select: {
            id: true,
          },
        },
        media: {
          select: {
            id: true,
            url: true,
            type: true,
          },
        },
      },
    });

    // Check if there are more posts
    const hasMore = posts.length > limit;
    const nextCursor = hasMore ? posts.pop()?.id : null;

    // Format posts for response
    const formattedPosts = posts.map((post) => ({
      id: post.id,
      content: post.content,
      title: post.title,
      createdAt: post.createdAt,
      user: post.user,
      commentCount: post._count.comments,
      likeCount: post._count.likes,
      isLiked: post.likes.length > 0,
      isBookmarked: post.bookmarks.length > 0,
      media: post.media,
    }));

    return NextResponse.json({
      posts: formattedPosts,
      nextCursor,
    });
  } catch (error) {
    console.error("[USER_POSTS_GET_ERROR]", error instanceof Error ? error.message : String(error));
    
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
