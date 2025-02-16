import { prisma } from "@/lib/prisma";
import { Post, Prisma } from "@prisma/client";
import { z } from "zod";

// Input validation schemas
export const createPostSchema = z.object({
  title: z.string()
    .trim()
    .max(100, "Title must be less than 100 characters")
    .optional()
    .transform(val => val === "" ? undefined : val),
  content: z.string()
    .trim()
    .min(1, "Content cannot be empty")
    .max(1000, "Content must be less than 1000 characters")
    .transform(val => val || " "),
  mediaUrls: z.array(z.string().url("Invalid media URL"))
    .max(4, "Maximum 4 images allowed")
    .optional()
    .default([]),
  userId: z.string().min(1, "User ID is required"),
  organizationId: z.string().min(1, "Organization ID is required"),
});

// Custom error messages
export const postValidationErrors = {
  title: {
    max: "Title must be less than 100 characters",
  },
  content: {
    min: "Content cannot be empty",
    max: "Content must be less than 1000 characters",
  },
  mediaUrls: {
    max: "Maximum 4 images allowed",
    url: "Invalid media URL",
  },
  userId: "User ID is required",
  organizationId: "Organization ID is required",
} as const;

export const getFeedPostsSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().min(1).max(50).optional(),
  userId: z.string().min(1),
  organizationId: z.string().min(1),
});

// Types derived from schemas
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type GetFeedPostsInput = z.infer<typeof getFeedPostsSchema>;

// Response types
import { PostsPage } from "@/lib/types";

export type PostsResponse = PostsPage;

// Service functions
export async function createPost(input: CreatePostInput): Promise<Post & {
  user: { id: string; name: string | null; image: string | null };
  _count: { likes: number; comments: number };
}> {
  const { title, content, mediaUrls, userId, organizationId } = input;

  try {
    return await prisma.post.create({
      data: {
        title: title?.trim(),
        content: content.trim(),
        mediaUrls: mediaUrls || [],
        userId,
        organizationId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma errors
      if (error.code === 'P2002') {
        throw new Error('A post with this content already exists');
      }
      throw new Error('Database error: ' + error.message);
    }
    throw new Error('Failed to create post: ' + (error as Error).message);
  }
}

export async function getFeedPosts(input: GetFeedPostsInput): Promise<PostsResponse> {
  const { cursor, limit = 10, userId, organizationId } = input;

  try {
    try {
      const posts = await prisma.post.findMany({
      where: {
        organizationId,
        OR: [
          { userId },
          {
            user: {
              followers: {
                some: {
                  followerId: userId,
                },
              },
            },
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    let nextCursor: string | null = null;
    if (posts.length > limit) {
      const nextItem = posts.pop();
      nextCursor = nextItem?.id || null;
    }

    return {
      posts,
      nextCursor,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma errors
      if (error.code === 'P2015') {
        throw new Error('Invalid cursor');
      }
      throw new Error('Database error: ' + error.message);
    }
    throw new Error('Failed to fetch posts: ' + (error as Error).message);
  }
}
