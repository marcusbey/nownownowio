"use client";

import InfiniteScrollContainer from "@/components/data-display/InfiniteScrollContainer";
import Post from "@/features/social/posts/components/post";
import PostsLoadingSkeleton from "@/features/social/posts/components/post-skeleton";
import kyInstance from "@/lib/ky";
import { PostsPage } from "@/features/posts/types";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { EmptyFeed } from "@/features/social/posts/components/empty-feed";
import { Button } from "@/components/core/button";

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
            "/api/posts/following",
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

  const posts = data?.pages.flatMap((page) => page.posts) || [];

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
    return <EmptyFeed message="No posts found. Start following people to see their posts here." />;
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
          onClick={() => queryClient.invalidateQueries({ queryKey: ["post-feed", "following"] })}
        >
          Try again
        </Button>
      </div>
    );
  }

  return (
    <InfiniteScrollContainer
      className="no-scrollbar h-full overflow-y-auto space-y-4"
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
      {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
    </InfiniteScrollContainer>
  );
}
