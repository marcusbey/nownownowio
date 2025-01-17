import kyInstance from "@/lib/ky";
import { PostData } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";

export interface GetPostsResponse {
  posts: PostData[];
  nextCursor: string | null;
}

export interface CreatePostData {
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
    .post("/api/posts", {
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
