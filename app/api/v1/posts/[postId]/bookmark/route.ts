import { validateRequest } from "@/lib/auth/helper";
import { prisma } from "@/lib/prisma";
import type { BookmarkInfo } from "@/lib/types";

export async function GET(
  req: Request,
  { params }: { params: { postId: string } },
) {
  // Get the postId directly without awaiting params (which is already resolved)
  const postId = params.postId;

  console.log(`[GET] /api/v1/posts/${postId}/bookmark - Request received`);

  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      console.log(`[GET] /api/v1/posts/${postId}/bookmark - Unauthorized`);
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`[GET] /api/v1/posts/${postId}/bookmark - Checking bookmark for user ${loggedInUser.id}`);

    // Use findFirst instead of findUnique for better performance with composite keys
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        userId: loggedInUser.id,
        postId: postId,
      },
      select: { id: true }, // Only select id for better performance
    });

    const data: BookmarkInfo = {
      isBookmarkedByUser: !!bookmark,
    };

    console.log(`[GET] /api/v1/posts/${postId}/bookmark - Response ready, bookmark exists: ${!!bookmark}`);
    return Response.json(data);
  } catch (error) {
    console.error(`[GET] /api/v1/posts/${postId}/bookmark - Error:`, error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { postId: string } },
) {
  const postId = params.postId;

  console.log(`[POST] /api/v1/posts/${postId}/bookmark - Request received`);

  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      console.log(`[POST] /api/v1/posts/${postId}/bookmark - Unauthorized`);
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`[POST] /api/v1/posts/${postId}/bookmark - Creating bookmark for user ${loggedInUser.id}`);

    // Check if bookmark already exists before creating
    const existingBookmark = await prisma.bookmark.findFirst({
      where: {
        userId: loggedInUser.id,
        postId: postId,
      },
      select: { id: true },
    });

    if (!existingBookmark) {
      // Only create if it doesn't exist - faster than upsert
      await prisma.bookmark.create({
        data: {
          userId: loggedInUser.id,
          postId: postId,
        },
      });
    }

    console.log(`[POST] /api/v1/posts/${postId}/bookmark - Bookmark created/updated successfully`);
    return Response.json({ isBookmarkedByUser: true });
  } catch (error) {
    console.error(`[POST] /api/v1/posts/${postId}/bookmark - Error:`, error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { postId: string } },
) {
  const postId = params.postId;

  console.log(`[DELETE] /api/v1/posts/${postId}/bookmark - Request received`);

  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      console.log(`[DELETE] /api/v1/posts/${postId}/bookmark - Unauthorized`);
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`[DELETE] /api/v1/posts/${postId}/bookmark - Deleting bookmark for user ${loggedInUser.id}`);

    await prisma.bookmark.deleteMany({
      where: {
        userId: loggedInUser.id,
        postId: postId,
      },
    });

    console.log(`[DELETE] /api/v1/posts/${postId}/bookmark - Bookmark deleted successfully`);
    return Response.json({ isBookmarkedByUser: false });
  } catch (error) {
    console.error(`[DELETE] /api/v1/posts/${postId}/bookmark - Error:`, error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
