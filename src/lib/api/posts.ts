import kyInstance from "@/lib/ky";
import { PostData } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";

interface GetPostsResponse {
  posts: PostData[];
  nextCursor: string | null;
}

export async function getPosts(cursor?: string | null, topic?: string) {
  const searchParams: Record<string, string> = {};
  if (cursor) searchParams.cursor = cursor;
  if (topic && topic !== 'all') searchParams.topic = topic;
  
  try {
    return await kyInstance
      .get("/api/posts/for-you", { 
        searchParams,
        timeout: 15000, // 15 second timeout
        retry: {
          limit: 2,
          methods: ['get'],
          statusCodes: [408, 500, 502, 503, 504]
        }
      })
      .json<GetPostsResponse>();
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}

export function useInfinitePosts(topic?: string) {
  return useInfiniteQuery({
    queryKey: ["posts", topic],
    queryFn: ({ pageParam }) => getPosts(pageParam as string | null, topic),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    keepPreviousData: true,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * (2 ** attemptIndex), 30000),
  });
}
