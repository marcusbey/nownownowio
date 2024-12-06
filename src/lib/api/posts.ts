import kyInstance from "@/lib/ky";
import { PostData } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";

interface GetPostsResponse {
  posts: PostData[];
  nextCursor: string | null;
}

export async function getPosts(cursor?: string | null) {
  return kyInstance
    .get("/api/posts/for-you", cursor ? { searchParams: { cursor } } : {})
    .json<GetPostsResponse>();
}

export function useInfinitePosts() {
  return useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam }) => getPosts(pageParam as string | null),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
  });
}
