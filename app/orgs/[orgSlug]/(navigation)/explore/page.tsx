"use client";

import { useInfinitePosts } from "@/lib/api/posts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Post from "@/components/posts/Post";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import PostComposer from "@/components/posts/PostComposer";
import { motion } from "framer-motion";

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
  const { data, fetchNextPage, hasNextPage, isLoading } = useInfinitePosts();
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

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
              <a href={`?topic=${t.id}`}>
                {t.label}
              </a>
            </Button>
          ))}
        </div>
      </nav>

      <PostComposer />

      <div className="space-y-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Skeleton className="h-[200px] w-full rounded-xl" />
            </motion.div>
          ))
        ) : (
          data?.pages.map((page, i) => (
            <div key={i} className="space-y-6">
              {page.posts.map((post) => (
                <Post key={post.id} post={post} />
              ))}
            </div>
          ))
        )}
        
        <div ref={ref} className="h-20" />
        
        {hasNextPage && (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              onClick={() => fetchNextPage()}
              className="animate-pulse"
            >
              Loading more posts...
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
