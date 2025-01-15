import kyInstance from "@/lib/ky";
import { PostData } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";

export interface GetPostsResponse {
  posts: PostData[];
  nextCursor: string | null;
}

export async function getPosts(cursor?: string | null, topic?: string) {
  const searchParams: Record<string, string> = {};
  if (cursor) searchParams.cursor = cursor;
  if (topic && topic !== 'all') searchParams.topic = topic;
  
  const maxAttempts = 3;
  let attempt = 0;
  let lastError;

  while (attempt < maxAttempts) {
    try {
      const response = await kyInstance
        .get("/api/posts/for-you", { 
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
      
      if (!response.posts) {
        throw new Error('Invalid response format');
      }
      
      return response;
    } catch (error) {
      lastError = error;
      attempt++;
      if (attempt === maxAttempts) break;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  console.error('Final error fetching posts:', lastError);
  throw lastError;
}

export function useInfinitePosts(topic?: string) {
  return useInfiniteQuery({
    queryKey: ["posts", topic],
    queryFn: ({ pageParam }) => getPosts(pageParam as string | null, topic),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: true,  // Changed to true to keep data fresh
    refetchOnMount: true,        // Changed to true for reliability
    retry: 3,                    // Increased retries
    retryDelay: (attemptIndex) => Math.min(1000 * (2 ** attemptIndex), 30000),
  });
}
