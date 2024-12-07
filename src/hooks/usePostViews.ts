import { useQuery, useQueryClient } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";

interface ViewCountResponse {
  viewCount: number;
}

export function usePostViews(postId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["post-views", postId];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const response = await kyInstance
          .post(`/api/posts/${postId}/views`)
          .json<ViewCountResponse>();
        return response.viewCount;
      } catch (error) {
        console.error("Error fetching view count:", error);
        return 0;
      }
    },
    // Refetch on mount to ensure accurate counts
    staleTime: 0,
    // Cache the result for 1 minute
    cacheTime: 60 * 1000,
    // Don't refetch on window focus to prevent unnecessary counts
    refetchOnWindowFocus: false,
  });

  return {
    viewCount: data ?? 0,
    isLoading,
  };
}
