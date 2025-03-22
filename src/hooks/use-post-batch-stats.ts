import { useQuery, useQueryClient } from "@tanstack/react-query";

type PostStat = {
    views?: number;
    likes?: number;
    comments?: number;
};

type BatchStatsResponse = Record<string, PostStat>;

type BatchStatsOptions = {
    stats?: ("views" | "likes" | "comments")[];
    enabled?: boolean;
};

/**
 * A hook to fetch batch statistics for multiple posts at once
 */
export function usePostBatchStats(
    postIds: string[],
    options: BatchStatsOptions = {}
) {
    const queryClient = useQueryClient();
    const { stats = ["views", "likes", "comments"], enabled = true } = options;

    // Skip empty arrays or disabled queries
    const shouldFetch = enabled && postIds.length > 0;

    // Create a stable key for the query
    const queryKey = ["post-batch-stats", postIds.sort().join(","), stats.sort().join(",")];

    const { data, isLoading, error } = useQuery({
        queryKey,
        queryFn: async () => {
            const response = await fetch("/api/v1/posts/batch-stats", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    postIds,
                    stats,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch batch stats");
            }

            return response.json() as Promise<BatchStatsResponse>;
        },
        // Store in cache for longer since stats don't change frequently
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        // Don't refetch on component remounts
        refetchOnMount: false,
        // Only enabled if we have postIds and the query is explicitly enabled
        enabled: shouldFetch,
        // Update individual post stats in the cache
        onSuccess: (data) => {
            Object.entries(data).forEach(([postId, stats]) => {
                // Update views cache if available
                if (stats.views !== undefined) {
                    queryClient.setQueryData(
                        ["postViews", postId],
                        { views: stats.views }
                    );
                }

                // Update likes cache if available
                if (stats.likes !== undefined) {
                    queryClient.setQueryData(
                        ["like-info", postId],
                        { likes: stats.likes, isLikedByUser: false } // Default to false, will be updated if user liked
                    );
                }
            });
        },
    });

    return {
        data,
        isLoading,
        error,
        getStatForPost: (postId: string): PostStat => data[postId] || {},
    };
} 