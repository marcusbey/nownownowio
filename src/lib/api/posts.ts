import kyInstance from "@/lib/ky";
import { logger } from "@/lib/logger";
import type { PostData } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { cache } from "react";

export type GetPostsResponse = {
  posts: PostData[];
  nextCursor: string | null;
}

export type CreatePostData = {
  content: string;
  media?: File[];
  orgSlug?: string;
}

export type GetPostsOptions = {
  cursor?: string | null;
  topic?: string;
  limit?: number;
  includeComments?: boolean;
  orgId?: string;
  userId?: string;
  filter?: 'recent' | 'popular' | 'following';
  page?: number;
  pageSize?: number;
}

export async function createPost(data: CreatePostData) {
  const formData = new FormData();
  formData.append("content", data.content);

  if (data.orgSlug) {
    formData.append("orgSlug", data.orgSlug);
  }

  if (data.media) {
    data.media.forEach((file, index) => {
      formData.append(`media[${index}]`, file);
    });
  }

  const response = await kyInstance
    .post("/api/v1/posts", {
      body: formData,
    })
    .json<PostData>();

  return response;
}

export async function getPosts(options: GetPostsOptions = {}) {
  const { cursor, topic, includeComments = false } = options;
  const searchParams: Record<string, string> = {};

  if (cursor) searchParams.cursor = cursor;
  if (topic && topic !== 'all') searchParams.topic = topic;
  if (includeComments) searchParams.includeComments = 'true';

  const maxAttempts = 3;
  let lastError;

  async function attemptRequest(attempt: number): Promise<GetPostsResponse> {
    try {
      return await kyInstance
        .get("/api/v1/posts/for-you", {
          searchParams,
          timeout: false,
          retry: {
            limit: 2,
            methods: ['get'],
            statusCodes: [408, 500, 502, 503, 504],
            delay: (attemptCount) => Math.min(1000 * Math.pow(2, attemptCount), 10000),
          }
        })
        .json<GetPostsResponse>();
    } catch (error) {
      if (attempt < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        return attemptRequest(attempt + 1);
      }
      throw error;
    }
  }

  try {
    return await attemptRequest(0);
  } catch (error) {
    logger.error('Final error fetching posts:', error);
    throw error;
  }
}

export async function getPostsWithUserData(params: {
  userId: string;
  type: 'likes' | 'media';
  cursor?: string | null;
  limit?: number;
  includeComments?: boolean;
}): Promise<GetPostsResponse> {
  const { userId, type, cursor, limit = 10, includeComments = false } = params;

  const searchParams = new URLSearchParams();
  if (cursor) searchParams.set('cursor', cursor);
  if (limit) searchParams.set('limit', limit.toString());
  if (includeComments) searchParams.set('includeComments', 'true');

  const endpoint = `/api/v1/users/${userId}/${type}?${searchParams}`;

  return kyInstance.get(endpoint).json<GetPostsResponse>();
}

export function useInfinitePosts(options: { topic?: string; includeComments?: boolean }) {
  const { topic, includeComments = false } = options;

  return useInfiniteQuery<
    GetPostsResponse,
    Error,
    { pages: GetPostsResponse[]; pageParams: (string | null)[] },
    [string, string | undefined, boolean],
    string | null
  >({
    queryKey: ["posts", topic, includeComments],
    queryFn: async ({ pageParam }) => {
      return getPosts({ cursor: pageParam, topic, includeComments });
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetches posts with built-in React caching
 * This uses React's cache() function to memoize results
 */
export const fetchPosts = cache(async (options: GetPostsOptions) => {
  const {
    page = 1,
    pageSize = 10,
    orgId,
    userId,
    filter,
    includeComments = false
  } = options;

  const params = new URLSearchParams();

  if (page) params.set('page', page.toString());
  if (pageSize) params.set('pageSize', pageSize.toString());
  if (orgId) params.set('orgId', orgId);
  if (userId) params.set('userId', userId);
  if (filter) params.set('filter', filter);
  if (includeComments) params.set('includeComments', 'true');

  const queryString = params.toString();
  const url = `/api/v1/posts${queryString ? `?${queryString}` : ''}`;

  // Use Next.js fetch with revalidate option
  const response = await fetch(url, {
    next: {
      // Revalidate every 30 seconds
      revalidate: 30,
      // Add tags for more granular invalidation
      tags: ['posts', orgId ? `org-${orgId}` : '', userId ? `user-${userId}` : ''],
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch posts: ${response.statusText}`);
  }

  return response.json();
});

/**
 * Fetches a single post with caching
 */
export const fetchPost = cache(async (postId: string, includeComments = false) => {
  const params = new URLSearchParams();
  if (includeComments) params.set('includeComments', 'true');

  const queryString = params.toString();
  const url = `/api/v1/posts/${postId}${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    next: {
      revalidate: 60, // Cache for 1 minute
      tags: [`post-${postId}`],
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch post: ${response.statusText}`);
  }

  return response.json();
});

/**
 * Manually revalidate posts data when needed
 * Call this after creating/updating posts
 */
export async function revalidatePostsData(tags: string[] = ['posts']) {
  try {
    await fetch('/api/v1/revalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tags }),
    });
  } catch (error) {
    console.error('Failed to revalidate posts data:', error);
  }
}

/**
 * Fetch comments for a specific post
 * Use this when user expands comments section
 */
export async function fetchPostComments(postId: string, cursor?: string) {
  const params = new URLSearchParams();
  if (cursor) params.set('cursor', cursor);

  const queryString = params.toString();
  const url = `/api/v1/posts/${postId}/comments${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    next: {
      revalidate: 30, // Cache for 30 seconds
      tags: [`post-${postId}-comments`],
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch comments: ${response.statusText}`);
  }

  return response.json();
}
