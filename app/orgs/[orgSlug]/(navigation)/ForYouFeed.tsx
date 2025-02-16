"use client";

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import Post from "@/components/posts/Post";
import PostsLoadingSkeleton from "@/components/posts/PostsLoadingSkeleton";
import kyInstance from "@/lib/ky";
import { PostsPage } from "@/lib/types";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import { EmptyFeed } from "@/components/posts/EmptyFeed";

export default function ForYouFeed() {
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
    queryKey: ["post-feed", "for-you"],
    queryFn: async ({ pageParam }) => {
      try {
        return await kyInstance
          .get(
            "/api/posts/for-you",
            pageParam ? { searchParams: { cursor: pageParam } } : {},
          )
          .json<PostsPage>();
      } catch (error: any) {
        // If it's a 404 (no posts), return empty page
        if (error.response?.status === 404) {
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
    networkMode: 'offlineFirst',
  });

  const posts = useMemo(
    () => data?.pages.flatMap((page) => page.posts) || [],
    [data?.pages]
  );

  if (status === "pending" && !data) {
    return <PostsLoadingSkeleton />;
  }

  // Show empty state if:
  // 1. Query succeeded but no posts
  // 2. Got a 404 response (no posts)
  if (
    (status === "success" && !posts.length && !hasNextPage) ||
    (error as any)?.response?.status === 404
  ) {
    return <EmptyFeed />;
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 space-y-3">
        <p className="text-center text-destructive font-medium">
          An error occurred while loading posts
        </p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["post-feed", "for-you"] })}
        >
          Try again
        </Button>
      </div>
    );
  }

  return (
    <InfiniteScrollContainer
      onBottomReached={() => {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }}
      className="no-scrollbar h-full overflow-y-auto space-y-4"
    >
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </InfiniteScrollContainer>
  );
}
