import { useQuery } from "@tanstack/react-query";
import { ENDPOINTS } from "@/lib/api/apiEndpoints";

interface PostViews {
  views: number;
}

async function getPostViews(postId: string): Promise<PostViews> {
  const response = await fetch(ENDPOINTS.POST_VIEWS(postId));
  if (!response.ok) {
    throw new Error("Failed to fetch post views");
  }
  return response.json();
}

export function usePostViews(postId: string) {
  const { data, isLoading } = useQuery({
    queryKey: ["postViews", postId],
    queryFn: () => getPostViews(postId),
  });

  return {
    views: data?.views ?? 0,
    isLoading,
  };
}
