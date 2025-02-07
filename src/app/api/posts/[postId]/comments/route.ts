import { prisma } from "@/lib/prisma";
import { CommentsPage, getCommentDataInclude } from "@/lib/types";
import { createApiHandler } from "@/lib/api/apiHandler";
import { withPagination, createPaginatedQuery } from "@/lib/api/middleware";

export const GET = createApiHandler(
  async ({ user, params, middlewareData }) => {
    const { cursor, pageSize } = middlewareData.pagination;

    const comments = await prisma.comment.findMany({
      where: { postId: params!.postId },
      include: getCommentDataInclude(user.id),
      orderBy: { createdAt: "asc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const { data, nextCursor } = await createPaginatedQuery(comments, { pageSize });
    
    return { 
      data: { comments: data, nextCursor },
      status: 200 
    };
  },
  withPagination(5)
);

export const POST = createApiHandler(async ({ user, params, req }) => {
  const { content } = await req.json();

  if (!content?.trim()) {
    return { error: "Comment content is required", status: 400 };
  }

  const comment = await prisma.comment.create({
    data: {
      content: content.trim(),
      userId: user.id,
      postId: params!.postId,
    },
    include: getCommentDataInclude(user.id),
  });

  return { data: comment, status: 201 };
});
