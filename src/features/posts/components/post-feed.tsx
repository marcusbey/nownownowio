"use client";

import { useCallback, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { getFeedPosts } from "@/features/posts/services/post-service";
import { PostCard } from "@/features/posts/components/post-card";
import type { ExtendedPost } from "@/features/posts/types";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

interface PostFeedProps {
  organizationId: string;
  initialPosts?: ExtendedPost[];
  pageSize?: number;
}

export function PostFeed({
  organizationId,
  initialPosts = [],
  pageSize = 20,
}: PostFeedProps) {
  const [posts, setPosts] = useState<ExtendedPost[]>(initialPosts);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { ref, inView } = useInView();

  const loadMorePosts = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const lastPost = posts[posts.length - 1];
      const newPosts = await getFeedPosts({
        organizationId,
        cursor: lastPost?.id,
        limit: pageSize,
      });

      if (newPosts.length < pageSize) {
        setHasMore(false);
      }

      setPosts((prev) => [...prev, ...newPosts]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load posts";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, posts, organizationId, pageSize]);

  useEffect(() => {
    if (inView && !isLoading) {
      loadMorePosts();
    }
  }, [inView, loadMorePosts]);

  if (error && !posts.length) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  if (!posts.length && !isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-muted-foreground font-medium">No posts yet. Be the first to post!</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {posts.map((post) => (
        <div key={post.id} className="py-6 first:pt-0">
          <PostCard post={post} />
        </div>
      ))}
      {hasMore && (
        <div ref={ref} className="flex justify-center py-8">
          {isLoading && <Spinner className="text-primary h-6 w-6" />}
        </div>
      )}
    </div>
  );
}
