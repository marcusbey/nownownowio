"use server";

import { validateRequest } from "@/lib/auth/helper";
import { prisma } from "@/lib/prisma";
import type { PostData } from "@/lib/types";
import { getCommentDataInclude } from "@/lib/types";
import { createCommentSchema } from "@/lib/validation";

export async function submitComment({
  post,
  content,
}: {
  post: PostData;
  content: string;
}) {
  const { user } = await validateRequest();

  const { content: contentValidated } = createCommentSchema.parse({ content });

  const [newComment] = await prisma.$transaction([
    prisma.comment.create({
      data: {
        content: contentValidated,
        postId: post.id,
        userId: user.id,
      },
      include: getCommentDataInclude(user.id),
    }),
    ...(post.user.id !== user.id
      ? [
        prisma.notification.create({
          data: {
            issuerId: user.id,
            recipientId: post.user.id,
            postId: post.id,
            type: "COMMENT",
          },
        }),
      ]
      : []),
  ]);

  return newComment;
}

export async function deleteComment(id: string) {
  const { user } = await validateRequest();

  const comment = await prisma.comment.findUnique({
    where: { id },
    include: {
      post: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!comment) throw new Error("Comment not found");

  // Allow both comment author and post owner to delete the comment
  const isCommentAuthor = comment.userId === user.id;
  const isPostOwner = comment.post.userId === user.id;

  if (!isCommentAuthor && !isPostOwner) {
    throw new Error("Unauthorized: Only the comment author or post owner can delete this comment");
  }

  const deletedComment = await prisma.comment.delete({
    where: { id },
    include: getCommentDataInclude(user.id),
  });

  return deletedComment;
}
