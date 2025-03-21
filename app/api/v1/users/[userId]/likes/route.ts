import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth/helper";
import { PrismaClient } from "@prisma/client";
import type { PostsPage } from "@/lib/types";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
): Promise<NextResponse> {
  try {
    const { user } = await validateRequest();
    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limit = 10;

    // Find posts that the user has liked
    const likedPosts = await prisma.like.findMany({
      where: {
        userId,
      },
      select: {
        postId: true,
      },
      take: limit + 1,
      ...(cursor
        ? {
            cursor: {
              id: cursor,
            },
            skip: 1,
          }
        : {}),
      orderBy: {
        id: "desc", // Using id as the sort field since createdAt doesn't exist in the Like model
      },
    });

    // Extract post IDs from likes
    const postIds = likedPosts.slice(0, limit).map((like) => like.postId);
    
    // Get the actual posts with user data
    // Since we don't have a direct function to get posts by IDs with user data,
    // we'll fetch them from the database directly
    const posts = await prisma.post.findMany({
      where: {
        id: { in: postIds }
      },
      include: {
        user: true,
        media: true,
        likes: {
          where: user ? { userId: user.id } : undefined,
        },
        bookmarks: {
          where: user ? { userId: user.id } : undefined,
        },
        comments: true,
        notifications: true,
        _count: {
          select: {
            likes: true,
            comments: true,
            bookmarks: true,
            views: true,
          },
        },
      },
    });

    // Determine the next cursor
    const nextCursor =
      likedPosts.length > limit ? likedPosts[limit - 1].postId : null;

    // Use unknown as an intermediate step for the type conversion
    const responseData = {
      posts,
      nextCursor,
    } as unknown as PostsPage;
    
    return NextResponse.json(responseData);
  } catch (error) {
    // Log error in development only
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error("Error fetching user likes:", error);
    }
    // Use unknown as an intermediate step for the type conversion
    const errorResponse = { 
      error: "Failed to fetch user likes", 
      posts: [], 
      nextCursor: null 
    } as unknown as PostsPage;
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
