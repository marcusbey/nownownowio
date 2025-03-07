import type { GetFollowerInfoFn } from "@/lib/api/followerInfo";
import type { FollowerInfo } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

/**
 * Client-safe hook for fetching follower info
 * Uses the server action through a fetch request instead of direct import
 */
export function useFollowerInfo(userId: string, initialData: FollowerInfo) {
  const { data: followerInfo, isLoading } = useQuery({
    queryKey: ["follower-info", userId],
    queryFn: async () => {
      // Use fetch API to call the server action endpoint
      const response = await fetch(`/api/v1/users/${userId}/follower-info`);
      if (!response.ok) {
        throw new Error(`Failed to fetch follower info: ${response.statusText}`);
      }
      return response.json() as Promise<FollowerInfo>;
    },
    initialData,
  });

  return {
    followerInfo,
    isLoading,
  };
}
