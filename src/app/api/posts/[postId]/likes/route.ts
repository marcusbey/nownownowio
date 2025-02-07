import { prisma } from "@/lib/prisma";
import { LikeInfo } from "@/lib/types";
import { createApiHandler } from "@/lib/api/apiHandler";

export const GET = createApiHandler(async ({ user, params }) => {
  const post = await prisma.post.findUnique({
    where: { id: params!.postId },
    select: {
      likes: {
        where: { userId: user.id },
        select: { userId: true },
      },
      _count: {
        select: { likes: true },
      },
    },
  });

  if (!post) {
    return { error: "Post not found", status: 404 };
  }

  const data: LikeInfo = {
    likes: post._count.likes,
    isLikedByUser: !!post.likes.length,
  };

  return { data, status: 200 };
});

export const POST = createApiHandler(async ({ user, params }) => {
  const post = await prisma.post.findUnique({
    where: { id: params!.postId },
    select: { userId: true },
  });

  if (!post) {
    return { error: "Post not found", status: 404 };
  }

  await prisma.$transaction([
    prisma.like.upsert({
      where: {
        userId_postId: {
          userId: user.id,
          postId: params!.postId,
        },
      },
      create: {
        userId: user.id,
        postId: params!.postId,
      },
      update: {},
    }),
    ...(user.id !== post.userId
      ? [
        prisma.notification.create({
          data: {
            issuerId: user.id,
            recipientId: post.userId,
            postId: params!.postId,
            type: "LIKE",
          },
        }),
      ]
      : []),
  ]);

  return { data: { success: true }, status: 200 };
});

export const DELETE = createApiHandler(async ({ user, params }) => {
  const post = await prisma.post.findUnique({
    where: { id: params!.postId },
    select: { userId: true },
  });

  if (!post) {
    return { error: "Post not found", status: 404 };
  }

  await prisma.$transaction([
    prisma.like.deleteMany({
      where: {
        userId: user.id,
        postId: params!.postId,
      },
    }),
    prisma.notification.deleteMany({
      where: {
        issuerId: user.id,
        recipientId: post.userId,
        postId: params!.postId,
        type: "LIKE",
      },
    }),
  ]);

  return { data: { success: true }, status: 200 };
});
