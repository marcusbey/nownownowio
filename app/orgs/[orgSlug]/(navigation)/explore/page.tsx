"use client";

import { Button } from "@/components/core/button";
import InfiniteScrollContainer from "@/components/data-display/InfiniteScrollContainer";
import { Skeleton } from "@/components/feedback/skeleton";
import Post from "@/features/social/posts/post";
import PostEditor from "@/features/social/posts/post-editor";
import kyInstance from "@/lib/ky";
import { getTopicDisplayInfo } from "@/lib/topic-detection";
import type { Post as PostType, PostsPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

// Default topics from the topic detection utility
const defaultTopics = getTopicDisplayInfo();

export default function ExplorePage() {
  const { data: session, status: sessionStatus } = useSession({ required: true });
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic") ?? "all";
  const [topics, setTopics] = useState(defaultTopics);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = useInfiniteQuery({
    queryKey: ["post-feed", "explore", topic, sessionStatus],
    queryFn: async ({ pageParam }) => {
      try {
        // Only fetch if authenticated
        if (sessionStatus !== "authenticated" || !session) {
          console.log("Not fetching posts - no authenticated session", { sessionStatus });
          return { posts: [], nextCursor: null } as PostsPage;
        }
        
        console.log("Fetching posts with topic:", topic);
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

  // Fetch trending topics when the component mounts
  useEffect(() => {
    const fetchTrendingTopics = async () => {
      if (sessionStatus === "authenticated" && session) {
        try {
          setIsLoadingTopics(true);
          console.log("Fetching trending topics with authenticated session");
          const response = await kyInstance.get("/api/v1/topics/trending").json<{ topics: Array<{id: string, label: string, trendingScore?: number}> }>();
          
          // Combine trending topics with default topics
          // Always keep 'All' as the first option
          const allOption = defaultTopics.find(t => t.id === "all");
          const trendingTopics = response.topics.slice(0, 5); // Limit to top 5 trending topics
          
          if (allOption && trendingTopics.length > 0) {
            setTopics([allOption, ...trendingTopics]);
            console.log("Set trending topics:", trendingTopics);
          } else {
            console.log("No trending topics found, using defaults");
            setTopics(defaultTopics);
          }
        } catch (error) {
          console.error("Failed to fetch trending topics", error);
          // Fall back to default topics on error
          setTopics(defaultTopics);
        } finally {
          setIsLoadingTopics(false);
        }
      } else if (sessionStatus === "loading") {
        console.log("Session is still loading");
      } else {
        console.log("No authenticated session found", { sessionStatus });
      }
    };
    
    void fetchTrendingTopics();
  }, [sessionStatus, session]);

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
          <div className="flex justify-between items-center px-4 py-1">
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-2">
            {isLoadingTopics ? (
              // Show skeleton loaders while loading topics
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-20 rounded-full" />
                ))}
              </>
            ) : (
              // Show topics with trending indicators
              topics.map((t) => (
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
                    {t.id !== "all" && (t as any).trendingScore && (
                      <span className="mr-1 text-xs">🔥</span>
                    )}
                    {t.label}
                  </Link>
                </Button>
              ))
            )}
            </div>
            <Link 
              href="./explore/debug" 
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Debug Topics
            </Link>
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
