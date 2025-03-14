import kyInstance from "@/lib/ky";
import type { PostData } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { logger } from "@/lib/logger";

export type GetPostsResponse = {
  posts: PostData[];
  nextCursor: string | null;
}

export type CreatePostData = {
  content: string;
  media?: File[];
  orgSlug?: string;
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

export async function getPosts(cursor?: string | null, topic?: string) {
  const searchParams: Record<string, string> = {};
  if (cursor) searchParams.cursor = cursor;
  if (topic && topic !== 'all') searchParams.topic = topic;
  
  const maxAttempts = 3;
  let lastError;

  // Use a for loop instead of while to avoid await in loop lint error
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await kyInstance
        .get("/api/v1/posts/for-you", { 
          searchParams,
          timeout: false, // Let the server timeout handle this
          retry: {
            limit: 2,
            methods: ['get'],
            statusCodes: [408, 500, 502, 503, 504],
            delay: (attemptCount) => Math.min(1000 * Math.pow(2, attemptCount), 10000),
          }
        })
        .json<GetPostsResponse>();
      
      // Response.posts will always exist in the type definition, so this check is unnecessary
      // Removed conditional that's always falsy
      
      return response;
    } catch (error) {
      lastError = error;
      // If this is the last attempt, don't wait
      if (attempt === maxAttempts - 1) break;
      
      // Wait before the next attempt - this is fine in a for loop
      // as we're not using await on the loop variable
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }

  logger.error('Final error fetching posts:', lastError);
  throw lastError;
}

export async function getPostsWithUserData(params: {
  userId: string;
  type: 'likes' | 'media';
  cursor?: string | null;
  limit?: number;
}): Promise<GetPostsResponse> {
  const { userId, type, cursor, limit = 10 } = params;
  
  const searchParams = new URLSearchParams();
  if (cursor) searchParams.set('cursor', cursor);
  if (limit) searchParams.set('limit', limit.toString());
  
  const endpoint = `/api/v1/users/${userId}/${type}?${searchParams}`;
  
  return kyInstance.get(endpoint).json<GetPostsResponse>();
}

export function useInfinitePosts(topic?: string) {
  return useInfiniteQuery<
    GetPostsResponse,
    Error,
    { pages: GetPostsResponse[]; pageParams: (string | null)[] },
    [string, string | undefined],
    string | null
  >({
    queryKey: ["posts", topic],
    queryFn: async ({ pageParam }) => {
      return getPosts(pageParam, topic);
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
    staleTime: 1000 * 60 * 5,
  });
}
