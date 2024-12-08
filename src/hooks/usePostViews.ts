import { useQuery, useQueryClient } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";

interface ViewCountResponse {
  viewCount: number;
  error?: string;
}

// Keep track of when we last viewed each post
const viewedPosts = new Map<string, number>();

export function usePostViews(postId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["post-views", postId];

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        // Check if we've viewed this post recently (within 5 minutes)
        const lastViewed = viewedPosts.get(postId);
        const now = Date.now();
        if (lastViewed && now - lastViewed < 5 * 60 * 1000) {
          // Just get the count without incrementing
          const response = await kyInstance
            .get(`/api/posts/${postId}/views`)
            .json<ViewCountResponse>();
          return response.viewCount;
        }

        // Record that we've viewed this post
        viewedPosts.set(postId, now);

        // Increment the view count
        const response = await kyInstance
          .post(`/api/posts/${postId}/views`)
          .json<ViewCountResponse>();

        if (response.error) {
          throw new Error(response.error);
        }

        return response.viewCount;
      } catch (error) {
        console.error("Error fetching view count:", error);
        // Don't throw the error, just return 0
        // This prevents the UI from breaking if view counting fails
        return 0;
      }
    },
    // Cache for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Keep in cache for 10 minutes
    cacheTime: 10 * 60 * 1000,
    // Don't refetch on window focus
    refetchOnWindowFocus: false,
    // Retry failed requests up to 3 times with exponential backoff
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  return {
    viewCount: data ?? 0,
    isLoading,
    error,
  };
}
