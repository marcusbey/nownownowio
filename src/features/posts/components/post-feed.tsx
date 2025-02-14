"use client";

import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { getFeedPosts } from "../services/post-service";
import { PostCard } from "./post-card";
import type { ExtendedPost } from "../types";

interface PostFeedProps {
  organizationId: string;
  initialPosts?: ExtendedPost[];
}

export function PostFeed({
  organizationId,
  initialPosts = [],
}: PostFeedProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { ref, inView } = useInView();

  const loadMorePosts = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const lastPost = posts[posts.length - 1];
      const newPosts = await getFeedPosts({
        organizationId,
        cursor: lastPost?.id,
      });

      if (newPosts.length < 20) {
        setHasMore(false);
      }

      setPosts((prev) => [...prev, ...newPosts]);
    } catch (error) {
      console.error("Failed to load more posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
