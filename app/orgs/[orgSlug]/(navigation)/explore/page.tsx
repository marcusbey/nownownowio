"use client";

import { useInfinitePosts } from "@/lib/api/posts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Post from "@/components/posts/Post";
import { useSearchParams } from "next/navigation";
import PostComposer from "@/components/posts/PostComposer";
import { motion } from "framer-motion";
import Link from "next/link";
import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import { useEffect, useState } from "react";

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
  const [loading, setLoading] = useState(status === "loading");

  useEffect(() => {
    if (status === "loading") {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [status]);

  if (error) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-sm text-red-800">
            Error loading posts. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
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
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <nav className="sticky top-0 -mx-4 bg-background/80 px-4 pb-4 pt-2 backdrop-blur-sm">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {topics.map((t) => (
            <Button
              key={t.id}
              variant={topic === t.id ? "default" : "ghost"}
              className="rounded-full"
              asChild
            >
              <Link href={`?topic=${t.id}`}>{t.label}</Link>
            </Button>
          ))}
        </div>
      </nav>

      <PostComposer />

      <InfiniteScrollContainer
        className="space-y-6"
        onBottomReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
      >
        {data?.pages.map((page, i) => (
          <div key={i} className="space-y-6">
            {page.posts.map((post) => (
              <Post key={post.id} post={post} />
            ))}
          </div>
        ))}
      </InfiniteScrollContainer>
    </div>
  );
}
