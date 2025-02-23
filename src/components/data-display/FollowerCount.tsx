"use client";

import { useFollowerInfo } from "@/hooks/use-follower-info";
import { formatNumber } from "@/lib/utils";

type FollowerCountProps = {
  userId: string;
  initialState: {
    followers: number;
    isFollowedByUser: boolean;
  };
};

export function FollowerCount({ userId, initialState }: FollowerCountProps) {
  const { followerInfo } = useFollowerInfo(userId, initialState);

  return (
    <span>
      Followers:{" "}
      <span className="font-semibold">
        {formatNumber(followerInfo?.followers ?? initialState.followers)}
      </span>
    </span>
  );
}
