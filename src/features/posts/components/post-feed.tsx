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
      <div className="p-4 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      {hasMore && (
        <div ref={ref} className="flex justify-center p-4">
          {isLoading && <Spinner />}
        </div>
      )}
    </div>
  );

  useEffect(() => {
    if (inView) {
      loadMorePosts();
    }
  }, [inView]);

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <PostForm organization={organization} userId={currentUser.id} />
      
      <div className="w-full space-y-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {hasMore && (
        <div ref={ref} className="py-4">
          {isLoading && <div>Loading more posts...</div>}
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="py-4 text-muted-foreground">
          No more posts to load
        </div>
      )}

      {!hasMore && posts.length === 0 && (
        <div className="py-4 text-muted-foreground">
          No posts yet. Be the first to post!
        </div>
      )}
    </div>
  );
}
