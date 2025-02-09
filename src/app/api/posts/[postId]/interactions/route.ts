import { prisma } from "@/lib/prisma";
import { BookmarkInfo, CommentsPage, LikeInfo, getCommentDataInclude } from "@/lib/types";
import { createApiHandler } from "@/lib/api/apiHandler";
import { withPagination, createPaginatedQuery } from "@/lib/api/middleware";

// Type-safe interaction types
const InteractionTypes = {
  LIKE: "like",
  COMMENT: "comment",
  BOOKMARK: "bookmark",
} as const;

type InteractionType = typeof InteractionTypes[keyof typeof InteractionTypes];

interface InteractionData {
  content?: string;
}

// Get interaction info
export const GET = createApiHandler(
  async ({ user, params, searchParams, middlewareData }) => {
    const type = searchParams?.type as InteractionType;
    const postId = params!.postId;

    switch (type) {
      case InteractionTypes.LIKE: {
        const post = await prisma.post.findUnique({
          where: { id: postId },
          select: {
            likes: {
              where: { userId: user.id },
              select: { userId: true },
            },
            _count: { select: { likes: true } },
          },
        });

        if (!post) return { error: "Post not found", status: 404 };

        const data: LikeInfo = {
          likes: post._count.likes,
          isLikedByUser: !!post.likes.length,
        };
        return { data, status: 200 };
      }

      case InteractionTypes.BOOKMARK: {
        const bookmark = await prisma.bookmark.findUnique({
          where: {
            userId_postId: { userId: user.id, postId },
          },
        });

        const data: BookmarkInfo = {
          isBookmarkedByUser: !!bookmark,
        };
        return { data, status: 200 };
      }

      case InteractionTypes.COMMENT: {
        const { cursor, pageSize } = middlewareData.pagination;
        const comments = await prisma.comment.findMany({
          where: { postId },
          include: getCommentDataInclude(user.id),
          orderBy: { createdAt: "asc" },
          take: pageSize + 1,
          cursor: cursor ? { id: cursor } : undefined,
        });

        const { data, nextCursor } = await createPaginatedQuery(comments, { pageSize });
        return { data: { comments: data, nextCursor }, status: 200 };
      }

      default:
        return { error: "Invalid interaction type", status: 400 };
    }
  },
  withPagination(5)
);

// Create/update interaction
export const POST = createApiHandler(async ({ user, params, searchParams, req }) => {
  const type = searchParams?.type as InteractionType;
  const postId = params!.postId;
  const data: InteractionData = await req.json();

  // Verify post exists
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });

  if (!post) return { error: "Post not found", status: 404 };

  switch (type) {
    case InteractionTypes.LIKE: {
      await prisma.like.upsert({
        where: {
          userId_postId: { userId: user.id, postId },
        },
        create: {
          userId: user.id,
          postId,
        },
        update: {},
      });
      return { status: 200 };
    }

    case InteractionTypes.BOOKMARK: {
      await prisma.bookmark.upsert({
        where: {
          userId_postId: { userId: user.id, postId },
        },
        create: {
          userId: user.id,
          postId,
        },
        update: {},
      });
      return { status: 200 };
    }

    case InteractionTypes.COMMENT: {
      const content = data.content?.trim();
      if (!content) return { error: "Comment content is required", status: 400 };

      const comment = await prisma.comment.create({
        data: {
          content,
          userId: user.id,
          postId,
        },
        include: getCommentDataInclude(user.id),
      });
      return { data: comment, status: 201 };
    }

    default:
      return { error: "Invalid interaction type", status: 400 };
  }
});

// Delete interaction
export const DELETE = createApiHandler(async ({ user, params, searchParams }) => {
  const type = searchParams?.type as InteractionType;
  const postId = params!.postId;

  switch (type) {
    case InteractionTypes.LIKE: {
      await prisma.like.delete({
        where: {
          userId_postId: { userId: user.id, postId },
        },
      });
      return { status: 200 };
    }

    case InteractionTypes.BOOKMARK: {
      await prisma.bookmark.delete({
        where: {
          userId_postId: { userId: user.id, postId },
        },
      });
      return { status: 200 };
    }

    default:
      return { error: "Invalid interaction type or operation not supported", status: 400 };
  }
});
