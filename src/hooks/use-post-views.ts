import { useQuery } from "@tanstack/react-query";

interface PostViews {
  views: number;
}

async function getPostViews(postId: string): Promise<PostViews> {
  const response = await fetch(`/api/v1/posts/${postId}/views`);
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
