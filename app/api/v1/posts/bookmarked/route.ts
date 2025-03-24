import { validateRequest } from "@/lib/auth/helper";
import { prisma } from "@/lib/prisma";
import type { PostsPage } from "@/lib/types";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export async function GET(req: NextRequest) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cursor = req.nextUrl.searchParams.get("cursor") ?? undefined;
    const pageSize = 20; // Increased page size to show more bookmarks

    // Get bookmarks for the current user with pagination
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: user.id,
      },
      include: {
        post: {
          include: {
            user: true,
            media: true,
            likes: true,
            bookmarks: true,
            comments: true,
            _count: {
              select: {
                likes: true,
                comments: true,
                bookmarks: true,
                views: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc", // Show newest bookmarks first
      },
      take: pageSize + 1, // Take one extra to determine if there's more
      cursor: cursor ? { id: cursor } : undefined,
    });

    // Check if there are more results
    const nextCursor =
      bookmarks.length > pageSize ? bookmarks[pageSize].id : null;

    // Map the data to the expected format
    const postsPage: PostsPage = {
      posts: bookmarks.slice(0, pageSize).map((bookmark) => bookmark.post),
      nextCursor,
    };

    return NextResponse.json(postsPage);
  } catch (error) {
    console.error("Error in bookmarked posts:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: "Failed to fetch bookmarked posts" },
      { status: 500 }
    );
  }
}
