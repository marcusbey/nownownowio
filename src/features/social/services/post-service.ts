import { prisma } from "@/lib/prisma/prisma";
import { ENDPOINTS } from "@/lib/api/apiEndpoints";
import { z } from "zod";

export const getFeedPostsSchema = z.object({
  userId: z.string(),
  organizationId: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
});

export const createPostSchema = z.object({
  userId: z.string(),
  content: z.string().min(1),
  mediaIds: z.array(z.string()).optional(),
});

export async function getFeedPosts(params: z.infer<typeof getFeedPostsSchema>) {
  const { userId, organizationId, cursor, limit } = params;

  return prisma.post.findMany({
    where: {
      OR: [
        { userId },
        {
          user: {
            organizations: {
              some: {
                id: organizationId,
              },
            },
          },
        },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    include: {
      user: true,
      media: true,
      _count: {
        select: {
          comments: true,
          likes: true,
        },
      },
    },
  });
}

export async function createPost(data: z.infer<typeof createPostSchema>) {
  const { userId, content, mediaIds } = data;

  return prisma.post.create({
    data: {
      userId,
      content,
      media: mediaIds
        ? {
          connect: mediaIds.map((id) => ({ id })),
        }
        : undefined,
    },
    include: {
      user: true,
      media: true,
      _count: {
        select: {
          comments: true,
          likes: true,
        },
      },
    },
  });
}

export async function deletePost(postId: string): Promise<void> {
  const response = await fetch(ENDPOINTS.POST_DETAIL(postId), {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete post");
  }
}

export async function likePost(postId: string): Promise<void> {
  const response = await fetch(ENDPOINTS.POST_LIKE(postId), {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to like post");
  }
}

export async function bookmarkPost(postId: string): Promise<void> {
  const response = await fetch(ENDPOINTS.POST_BOOKMARK(postId), {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to bookmark post");
  }
}
