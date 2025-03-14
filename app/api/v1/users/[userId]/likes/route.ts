import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth/helper";
import { PrismaClient } from "@prisma/client";
import type { PostsPage } from "@/lib/types";
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
        createdAt: "desc",
      },
    });

    // Extract post IDs from likes
    const postIds = likedPosts.slice(0, limit).map((like) => like.postId);
    
    // Get the actual posts with user data
    const posts = await getPostsWithUserData(postIds, user?.id);

    // Determine the next cursor
    const nextCursor =
      likedPosts.length > limit ? likedPosts[limit - 1].id : null;

    return NextResponse.json({
      posts,
      nextCursor,
    });
  } catch (error) {
    console.error("Error fetching user likes:", error);
    return NextResponse.json(
      { error: "Failed to fetch user likes" },
      { status: 500 }
    );
  }
}
