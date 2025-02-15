"use server";

import { prisma } from "@/lib/prisma";
import type { PostFormData, PostToggleLikeData, ExtendedPost } from "../types";

interface GetFeedPostsParams {
  organizationId?: string;
  cursor?: string;
  limit?: number;
}

export async function getFeedPosts({
  organizationId,
  cursor,
  limit = 20,
}: GetFeedPostsParams): Promise<ExtendedPost[]> {
  return prisma.post.findMany({
    where: organizationId ? { organizationId } : undefined,
    take: limit,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: "desc" },
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
}

export async function createPost({
  content,
  userId,
  organizationId,
}: PostFormData): Promise<ExtendedPost> {
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
}

export async function toggleLike({
  postId,
  userId,
  organizationId,
}: PostToggleLikeData): Promise<boolean> {
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
}
