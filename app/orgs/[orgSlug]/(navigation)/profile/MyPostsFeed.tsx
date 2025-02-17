"use client";

import InfiniteScrollContainer from "@/components/data-display/InfiniteScrollContainer";
import Post from "@/features/posts/components/Post";
import PostsLoadingSkeleton from "@/features/posts/components/PostsLoadingSkeleton";
import kyInstance from "@/lib/ky";
import { PostsPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface MyPostsFeedProps {
  userId: string;
}

export default function MyPostsFeed({ userId }: MyPostsFeedProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ["user-posts", userId],
      queryFn: async ({ pageParam }) =>
        kyInstance
          .get(`/api/users/${userId}/posts`, {
            searchParams: pageParam ? { cursor: pageParam } : {},
          })
          .json<PostsPage>(),
      initialPageParam: null as string | null,
      getNextPageParam: (lastPage: PostsPage) => lastPage.nextCursor,
    });

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  if (status === "pending") {
    return <PostsLoadingSkeleton />;
  }

  if (status === "error") {
    return (
      <p className="text-center text-destructive">
        An error occurred while loading your posts.
      </p>
    );
  }

  return (
    <InfiniteScrollContainer
      className="no-scrollbar h-full overflow-y-auto space-y-4 px-4 py-4"
      onBottomReached={() =>
        hasNextPage && !isFetchingNextPage && fetchNextPage()
      }
    >
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
      {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
      {!hasNextPage && posts.length > 0 && (
        <p className="text-center text-muted-foreground">No more posts.</p>
      )}
      {posts.length === 0 && (
        <p className="text-center">You have not posted anything yet.</p>
      )}
    </InfiniteScrollContainer>
  );
}
