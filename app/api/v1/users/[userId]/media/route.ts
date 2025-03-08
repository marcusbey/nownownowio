import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth/helper";
import { PrismaClient } from "@prisma/client";
import { PostsPage } from "@/lib/types";
import { getPostsWithUserData } from "@/lib/api/posts";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
): Promise<NextResponse<PostsPage>> {
  try {
    const { user } = await validateRequest();
    const { userId } = params;
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
    
    // Get the actual posts with user data
    const posts = await getPostsWithUserData(postIds, user?.id);

    // Determine the next cursor
    const nextCursor =
      postsWithMedia.length > limit ? postsWithMedia[limit - 1].id : null;

    return NextResponse.json({
      posts,
      nextCursor,
    });
  } catch (error) {
    console.error("Error fetching user media posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch user media posts" },
      { status: 500 }
    );
  }
}
