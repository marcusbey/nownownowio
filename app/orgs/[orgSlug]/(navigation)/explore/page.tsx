"use client";

import { getPosts } from "../posts/services/post-client";
import { ExtendedPost } from "../posts/types";
import { Button } from "@/components/core/button";
import { Skeleton } from "@/components/feedback/skeleton";
import Post from "@/features/social/posts/components/post";
import { useSearchParams } from "next/navigation";
import PostEditor from "@/features/social/posts/components/post-editor";
import { motion } from "framer-motion";
import Link from "next/link";
import InfiniteScrollContainer from "@/components/data-display/InfiniteScrollContainer";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const topics = [
  { id: "all", label: "All" },
  { id: "hot", label: "Hot" },
  { id: "startups", label: "Startups" },
  { id: "fundraising", label: "Fundraising" },
  { id: "tech", label: "Tech" },
  { id: "ai", label: "AI" },
  { id: "product", label: "Product" },
  { id: "design", label: "Design" },
];

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic") || "all";
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, error } = useInfinitePosts(topic);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(status !== "success");
  }, [status]);

  if (error) {
    return (
      <main className="flex w-full min-w-0 gap-5 p-4">
        <div className="w-full min-w-0 space-y-5">
          <div className="rounded-lg bg-red-50 p-4">
            <div className="flex flex-col items-center space-y-4">
              <p className="text-sm text-red-800">
                {error instanceof Error ? error.message : 'Error loading posts. Please try again.'}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  window.location.reload();
                }}
              >
                Retry Loading Posts
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="flex w-full min-w-0 gap-5 p-4">
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
    <main className="flex w-full min-w-0 gap-5 p-4 max-w-xl mx-auto">
      <div className="w-full min-w-0 space-y-5">
        <PostEditor />
        
        <nav className="sticky top-0 bg-background/80 backdrop-blur-sm">
          <div className="no-scrollbar flex gap-2 overflow-x-auto py-2 -mx-4 px-4">
            {topics.map((t) => (
              <Button
                key={t.id}
                variant={topic === t.id ? "default" : "ghost"}
                className="rounded-full whitespace-nowrap"
                asChild
              >
                <Link href={`?topic=${t.id}`}>{t.label}</Link>
              </Button>
            ))}
          </div>
        </nav>

        <InfiniteScrollContainer
          className="no-scrollbar h-full overflow-y-auto space-y-4"
          onBottomReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
        >
          {data?.pages.map((page, i) => (
            <div key={i} className="space-y-4">
              {page.posts.map((post) => (
                <Post key={post.id} post={post} />
              ))}
            </div>
          ))}
          {isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </InfiniteScrollContainer>
      </div>
    </main>
  );
}
