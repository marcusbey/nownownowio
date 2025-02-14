import { prisma } from "@/lib/prisma";
import { type Post } from "@prisma/client";

export const getFeedPosts = async ({
  organizationId,
  cursor,
  limit = 20,
}: {
  organizationId?: string;
  cursor?: string;
  limit?: number;
}) => {
  return prisma.post.findMany({
    where: organizationId ? { organizationId } : undefined,
    take: limit,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      organization: true,
      user: true,
      _count: {
        select: {
          comments: true,
          likes: true,
        },
      },
    },
  });
};

export const createPost = async ({
  content,
  userId,
  organizationId,
}: {
  content: string;
  userId: string;
  organizationId: string;
}) => {
  return prisma.post.create({
    data: {
      content,
      userId,
      organizationId,
    },
    include: {
      organization: true,
      user: true,
      _count: {
        select: {
          comments: true,
          likes: true,
        },
      },
    },
  });
};

export const toggleLike = async ({
  postId,
  userId,
  organizationId,
}: {
  postId: string;
  userId: string;
  organizationId: string;
}) => {
  const existingLike = await prisma.like.findFirst({
    where: { postId, userId, organizationId },
  });

  if (existingLike) {
    await prisma.like.delete({ where: { id: existingLike.id } });
    return false;
  }

  await prisma.like.create({
    data: { postId, userId, organizationId },
  });
  return true;
};

