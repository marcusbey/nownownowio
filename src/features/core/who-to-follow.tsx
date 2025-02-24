"use client";

import { ENDPOINTS } from "@/lib/api/apiEndpoints";
import UserAvatar from "@/components/composite/UserAvatar";
import Skeleton from "@/components/core/skeleton";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import FollowButton from "./FollowButton";
import UserTooltip from "./UserTooltip";

type User = {
  id: string;
  username: string;
  displayName: string;
  image: string | null;
  _count: {
    followers: number;
  };
  followers: unknown[];
};

export function WhoToFollowSection() {
  const { data = [], isLoading } = useQuery<User[]>({
    queryKey: ["whoToFollow"],
    queryFn: async () => {
      const response = await fetch(ENDPOINTS.WHO_TO_FOLLOW);
      if (!response.ok) throw new Error("Failed to fetch who to follow");
      return response.json();
    },
  });

  return (
    <div className="rounded-xl px-4 py-3">
      <h2 className="mb-3 px-2 text-xl font-bold">Who to Follow</h2>
      <div className="flex flex-col gap-4">
        {isLoading ? (
          // Loading skeletons
          <>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-9 w-[74px] rounded-md" />
              </div>
            ))}
          </>
        ) : data.length === 0 ? (
          <p className="px-2 text-muted-foreground">No suggestions available</p>
        ) : (
          data.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between px-2"
            >
              <div className="flex items-center gap-3">
                <UserTooltip user={user}>
                  <UserAvatar avatarUrl={user.image} className="size-10" />
                </UserTooltip>
                <div className="flex flex-col">
                  <Link
                    href={`/@${user.username}`}
                    className="line-clamp-1 font-semibold hover:underline"
                  >
                    {user.displayName}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    @{user.username}
                  </p>
                </div>
              </div>
              <FollowButton
                userId={user.id}
                initialState={{
                  followers: user._count.followers,
                  isFollowedByUser: user.followers.length > 0,
                }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
