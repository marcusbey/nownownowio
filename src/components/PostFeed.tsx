"use client";

import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useInfinitePosts } from "@/hooks/use-posts";
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

type PostFeedProps = {
  orgId?: string;
  userId?: string;
  filter?: string;
  pageSize?: number;
};

export function PostFeed({
  orgId,
  userId,
  filter,
  pageSize = 10,
}: PostFeedProps) {
  // Setup infinite query with React Query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
    refetch,
    isFetching,
  } = useInfinitePosts({ orgId, userId, filter, pageSize });

  // Setup intersection observer for infinite scroll
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });

  // Load more posts when the load more element comes into view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Handle different loading states
  if (status === "pending") {
    return <PostFeedSkeleton count={pageSize} />;
  }

  // Handle error state
  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg bg-muted/20 p-8 text-center">
        <ExclamationTriangleIcon className="mb-2 size-10 text-destructive" />
        <h3 className="mb-2 text-xl font-semibold">Failed to load posts</h3>
        <p className="mb-4 text-muted-foreground">
          {error instanceof Error
            ? error.message
            : "Something went wrong while loading posts"}
        </p>
        <Button
          variant="outline"
          onClick={async () => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2"
        >
          {isFetching ? (
            <>
              <ArrowPathIcon className="size-4 animate-spin" />
              Retrying...
            </>
          ) : (
            <>
              <ArrowPathIcon className="size-4" />
              Try Again
            </>
          )}
        </Button>
      </div>
    );
  }

  // Flatten the pages of posts
  const posts = data.pages.flatMap((page) => page.posts) || [];

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg bg-muted/20 p-8 text-center">
        <h3 className="mb-2 text-xl font-semibold">No posts found</h3>
        <p className="text-muted-foreground">
          {filter
            ? "Try changing your filter criteria"
            : "Check back later for new content"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Posts list */}
      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Loading indicator */}
      {isFetchingNextPage && <PostFeedSkeleton count={2} />}

      {/* Load more trigger for infinite scroll */}
      {hasNextPage && (
        <div ref={ref} className="flex h-20 items-center justify-center">
          <Skeleton className="h-20 w-full" />
        </div>
      )}

      {/* End of content message */}
      {!hasNextPage && posts.length > 0 && (
        <div className="py-6 text-center text-muted-foreground">
          <p>You've reached the end of the feed</p>
        </div>
      )}
    </div>
  );
}

// Skeleton loader for posts
function PostFeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className="space-y-4 rounded-lg border border-border p-5"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-5 w-[90%]" />
              <Skeleton className="h-5 w-[75%]" />
              <Skeleton className="h-40 w-full" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ))}
    </div>
  );
}
