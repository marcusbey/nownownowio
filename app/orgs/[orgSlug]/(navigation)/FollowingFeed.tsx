"use client";

import { Button } from "@/components/core/button";
import InfiniteScrollContainer from "@/components/data-display/InfiniteScrollContainer";
import { EmptyFeed } from "@/features/social/posts/empty-feed";
import Post from "@/features/social/posts/post";
import PostsLoadingSkeleton from "@/features/social/posts/post-skeleton";
import kyInstance from "@/lib/ky";
import type { PostsPage } from "@/lib/types";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function FollowingFeed() {
  const queryClient = useQueryClient();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
    error,
  } = useInfiniteQuery({
    queryKey: ["post-feed", "following"],
    queryFn: async ({ pageParam }) => {
      try {
        return await kyInstance
          .get(
            "/api/v1/posts/following",
            pageParam ? { searchParams: { cursor: pageParam } } : {},
          )
          .json<PostsPage>();
      } catch (error) {
        // Return empty page for 404 (no posts) or 401 (unauthorized)
        const status = (error as { response?: { status?: number } }).response?.status;
        if (status === 404 || status === 401) {
          return { posts: [], nextCursor: null } as PostsPage;
        }
        throw error;
      }
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1,
    networkMode: "offlineFirst",
  });

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  if (status === "pending") {
    return <PostsLoadingSkeleton />;
  }

  // Show empty state if:
  // 1. Query succeeded but no posts
  // 2. Got a 404 response (no posts)
  if (status === "success" && !posts.length) {
    return <EmptyFeed context="following" />;
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center space-y-3 px-4 py-12">
        <p className="text-center font-medium text-destructive">
          An error occurred while loading posts
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={async () =>
            queryClient.invalidateQueries({
              queryKey: ["post-feed", "following"],
            })
          }
        >
          Try again
        </Button>
      </div>
    );
  }

  return (
    <InfiniteScrollContainer
      className="no-scrollbar h-full space-y-6 p-4 overflow-y-auto"
      onBottomReached={async () =>
        hasNextPage && !isFetching && fetchNextPage()
      }
    >
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </InfiniteScrollContainer>
  );
}
