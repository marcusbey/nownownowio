"use client";

import UserAvatar from "@/components/composite/UserAvatar";
import Skeleton from "@/components/core/skeleton";
import { ENDPOINTS } from "@/lib/api/apiEndpoints";
import { fetchWithTimeout } from "@/lib/api/fetchWithTimeout";
import type { UserData } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";
import FollowButton from "./FollowButton";
import UserTooltip from "@/components/composite/UserTooltip";

// Simplified user type for who-to-follow API response
type WhoToFollowUser = {
  id: string;
  username: string;
  name: string;
  displayName: string | null;
  image: string | null;
  _count: {
    followers: number;
  };
  followers: { followerId: string }[];
};

export function WhoToFollowSection() {
  // Configure useSession to not throw errors on unauthenticated
  const { status } = useSession({
    required: false,
    onUnauthenticated() {
      // Do nothing, just silently handle the unauthenticated state
    },
  });

  const isAuthenticated = status === "authenticated";

  const {
    data = [],
    isLoading,
    error,
  } = useQuery<WhoToFollowUser[]>({
    queryKey: ["whoToFollow"],
    queryFn: async () => {
      // Use our enhanced fetch utility with built-in error handling
      const result = await fetchWithTimeout<WhoToFollowUser[]>(ENDPOINTS.WHO_TO_FOLLOW, {
        timeout: 5000,
        retries: 1
      });
      
      // Return empty array if fetch failed
      return result ?? [];
    },
    // Only run query if user is authenticated
    enabled: isAuthenticated,
    // Don't keep retrying on error since our fetchWithTimeout already handles retries
    retry: 0,
    // Increase stale time to reduce frequent refetches
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
  });

  if (!isAuthenticated) {
    return null; // Don't show this section for unauthenticated users
  }

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
        ) : error ? (
          <p className="px-2 text-muted-foreground">
            Unable to load suggestions
          </p>
        ) : data.length === 0 ? (
          <p className="px-2 text-muted-foreground">No suggestions available</p>
        ) : (
          data.map((user: WhoToFollowUser) => (
            <div
              key={user.id}
              className="flex items-center justify-between px-2"
            >
              <div className="flex items-center gap-3">
                {/* Convert WhoToFollowUser to match required UserTooltip props */}
                <UserTooltip
                  user={
                    {
                      id: user.id,
                      name: user.name,
                      displayName: user.displayName,
                      image: user.image,
                      _count: { followers: user._count.followers },
                      followers: user.followers,
                    } as UserData
                  }
                >
                  <UserAvatar avatarUrl={user.image} className="size-10" />
                </UserTooltip>
                <div className="flex flex-col">
                  <Link
                    href={`/@${user.username}`}
                    className="line-clamp-1 font-semibold hover:underline"
                  >
                    {user.displayName ?? user.name}
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
