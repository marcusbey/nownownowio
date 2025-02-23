import { getFollowerInfo } from "@/lib/api/followerInfo";
import type { FollowerInfo } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

export function useFollowerInfo(userId: string, initialData: FollowerInfo) {
  const { data: followerInfo, isLoading } = useQuery({
    queryKey: ["follower-info", userId],
    queryFn: () => getFollowerInfo(userId),
    initialData,
  });

  return {
    followerInfo,
    isLoading,
  };
}
