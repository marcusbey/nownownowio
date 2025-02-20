"use client";

import { Button } from "@/components/core/button";
import InfiniteScrollContainer from "@/components/data-display/InfiniteScrollContainer";
import { Skeleton } from "@/components/feedback/skeleton";
import Post from "@/features/social/posts/post";
import PostEditor from "@/features/social/posts/post-editor";
import kyInstance from "@/lib/ky";
import type { Post as PostType, PostsPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const topics = [
  { id: "all", label: "All" },
  { id: "tech", label: "Tech" },
  { id: "design", label: "Design" },
  { id: "marketing", label: "Marketing" },
  { id: "business", label: "Business" },
];

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic") ?? "all";
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = useInfiniteQuery({
    queryKey: ["post-feed", "explore", topic],
    queryFn: async ({ pageParam }) => {
      try {
        return await kyInstance
          .get(
            "/api/v1/posts/explore",
            pageParam
              ? { searchParams: { cursor: pageParam, topic } }
              : { searchParams: { topic } },
          )
          .json<PostsPage>();
      } catch (error) {
        if (
          (error as { response?: { status?: number } }).response?.status === 404
        ) {
          return { posts: [], nextCursor: null } as PostsPage;
        }
        throw error;
      }
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [topic]);

  if (status === "error") {
    return (
      <main className="mx-auto flex w-full min-w-0 max-w-xl gap-5 p-4">
        <div className="w-full min-w-0 space-y-5">
          <div className="flex flex-col items-center space-y-4">
            <p className="text-sm text-red-800">
              {error instanceof Error
                ? error.message
                : "Error loading posts. Please try again."}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                window.location.reload();
              }}
            >
              Retry
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="mx-auto flex w-full min-w-0 max-w-xl gap-5 p-4">
        <div className="w-full min-w-0 space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Skeleton className="h-[200px] w-full rounded-xl" />
            </motion.div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full min-w-0 max-w-xl gap-5 p-4">
      <div className="w-full min-w-0 space-y-5">
        <PostEditor />

        <nav className="sticky top-0 bg-background/80 backdrop-blur-sm">
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-2">
            {topics.map((t) => (
              <Button
                key={t.id}
                variant={topic === t.id ? "default" : "ghost"}
                className="whitespace-nowrap rounded-full"
                asChild
              >
                <Link
                  href={{
                    query: t.id === "all" ? {} : { topic: t.id },
                  }}
                >
                  {t.label}
                </Link>
              </Button>
            ))}
          </div>
        </nav>

        <InfiniteScrollContainer
          className="no-scrollbar h-full space-y-4 overflow-y-auto"
          onBottomReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              void fetchNextPage();
            }
          }}
        >
          {posts.map((post: PostType) => (
            <Post key={post.id} post={post} />
          ))}
          {isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </InfiniteScrollContainer>
      </div>
    </main>
  );
}
