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

    // Find posts with media from this user
    const postsWithMedia = await prisma.post.findMany({
      where: {
        userId,
        media: {
          some: {} // Has at least one media item
        }
      },
      select: {
        id: true,
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
        createdAt: "desc",
      },
    });

    // Extract post IDs
    const postIds = postsWithMedia.slice(0, limit).map((post) => post.id);
    
    // Get the actual posts with user data directly from Prisma
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
      postsWithMedia.length > limit ? postsWithMedia[limit - 1].id : null;

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
      console.error("Error fetching user media posts:", error);
    }
    
    // Use unknown as an intermediate step for the type conversion
    const errorResponse = { 
      error: "Failed to fetch user media posts", 
      posts: [], 
      nextCursor: null 
    } as unknown as PostsPage;
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
