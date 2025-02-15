import { useQuery } from "@tanstack/react-query";
import { getFollowerInfo } from "@/lib/social/followerInfo";

export function useFollowerInfo(userId: string) {
  const { data: followerInfo, isLoading } = useQuery({
    queryKey: ["followerInfo", userId],
    queryFn: () => getFollowerInfo(userId),
  });

  return {
    followerInfo,
    isLoading,
  };
}
