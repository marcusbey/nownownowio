"use client";

import { Button } from "@/components/core/button";
import { Input } from "@/components/core/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/core/tabs";
import InfiniteScrollContainer from "@/components/data-display/InfiniteScrollContainer";
import { Skeleton } from "@/components/feedback/skeleton";
import Post from "@/features/social/posts/post";
import kyInstance from "@/lib/ky";
import { getTopicDisplayInfo } from "@/lib/topic-detection";
import type { PostData, Post as PostType } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Cog, Flame, Loader2, Music, Newspaper, Search, Trophy } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// Define the topic type to include trendingScore
type Topic = {
  id: string;
  label: string;
  trendingScore?: number;
};

// Define the PostsPage type
type PostsPage = {
  posts: PostType[];
  nextCursor: string | null;
};

// Default topics from the topic detection utility
const defaultTopics = getTopicDisplayInfo() as Topic[];

export default function ExplorePage() {
  const { data: session, status: sessionStatus } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const topic = searchParams.get("topic") ?? "all";
  const searchQuery = searchParams.get("q") ?? "";
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [topics, setTopics] = useState<Topic[]>(defaultTopics);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = useInfiniteQuery({
    queryKey: ["post-feed", "explore", topic, searchQuery, sessionStatus],
    queryFn: async ({ pageParam }) => {
      try {
        // Only fetch if authenticated
        if (sessionStatus !== "authenticated") {
          console.log("Not fetching posts - no authenticated session", {
            sessionStatus,
          });
          return { posts: [], nextCursor: null } as PostsPage;
        }

        console.log(
          "Fetching posts with topic:",
          topic,
          "and search:",
          searchQuery,
        );
        const searchParams: Record<string, string> = { topic };
        if (pageParam) searchParams.cursor = pageParam;
        if (searchQuery) searchParams.q = searchQuery;

        return await kyInstance
          .get("/api/v1/posts/explore", { searchParams })
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
    enabled: sessionStatus === "authenticated", // Only run query when authenticated
  });

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];
  const [loading, setLoading] = useState(false);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);

    if (searchInput) {
      params.set("q", searchInput);
    } else {
      params.delete("q");
    }

    router.push(`?${params.toString()}`);
  };

  // Fetch trending topics when the component mounts
  useEffect(() => {
    const fetchTrendingTopics = async () => {
      try {
        setIsLoadingTopics(true);
        console.log("Fetching trending topics");
        const response = await kyInstance.get("/api/v1/topics/trending").json<{
          topics: { id: string; label: string; trendingScore?: number }[];
        }>();

        // Combine trending topics with default topics
        // Always keep 'All' as the first option
        const allOption = defaultTopics.find((t) => t.id === "all");
        const trendingTopics = response.topics.slice(0, 5); // Limit to top 5 trending topics

        if (allOption) {
          // Ensure we have at least 4 topics (including 'All')
          let finalTopics = [allOption];

          if (trendingTopics.length > 0) {
            // Add trending topics if available
            finalTopics = [...finalTopics, ...trendingTopics];
          } else {
            // If no trending topics, add at least 3 default topics (excluding 'All')
            const otherDefaultTopics = defaultTopics.filter(
              (t) => t.id !== "all",
            );
            finalTopics = [...finalTopics, ...otherDefaultTopics];
          }

          // Ensure we have at least 4 topics total
          if (finalTopics.length < 4) {
            const remainingDefaultTopics = defaultTopics
              .filter((t) => !finalTopics.some((ft) => ft.id === t.id))
              .slice(0, 4 - finalTopics.length);
            finalTopics = [...finalTopics, ...remainingDefaultTopics];
          }

          setTopics(finalTopics);
          console.log("Set topics:", finalTopics);
        } else {
          console.log("No 'All' option found, using defaults");
          // Ensure at least 4 default topics
          setTopics(defaultTopics.slice(0, Math.max(4, defaultTopics.length)));
        }
      } catch (error) {
        console.error("Failed to fetch trending topics", error);
        // Fall back to default topics on error, ensuring at least 4
        setTopics(defaultTopics.slice(0, Math.max(4, defaultTopics.length)));
      } finally {
        setIsLoadingTopics(false);
      }
    };

    void fetchTrendingTopics();
  }, []);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [topic, searchQuery]);

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
    <main className="mx-auto flex w-full min-w-0 max-w-xl flex-col p-0">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <form onSubmit={handleSearch}>
            <Input
              type="text"
              placeholder="Search posts"
              className="pl-9 rounded-full bg-muted/50 border-none"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </form>
        </div>
        <Link href="./explore/debug" className="ml-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Cog className="size-5" />
            <span className="sr-only">Settings</span>
          </Button>
        </Link>
      </div>
      
      <Tabs defaultValue="for-you" className="w-full">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
          <TabsList className="w-full h-12 bg-transparent justify-between p-0">
            <TabsTrigger 
              value="for-you" 
              className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:rounded-none data-[state=active]:shadow-none h-full rounded-none"
            >
              For you
            </TabsTrigger>
            <TabsTrigger 
              value="trending" 
              className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:rounded-none data-[state=active]:shadow-none h-full rounded-none"
            >
              <Flame className="mr-2 size-4" />
              Trending
            </TabsTrigger>
            <TabsTrigger 
              value="news" 
              className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:rounded-none data-[state=active]:shadow-none h-full rounded-none"
            >
              <Newspaper className="mr-2 size-4" />
              News
            </TabsTrigger>
            <TabsTrigger 
              value="sports" 
              className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:rounded-none data-[state=active]:shadow-none h-full rounded-none"
            >
              <Trophy className="mr-2 size-4" />
              Sports
            </TabsTrigger>
            <TabsTrigger 
              value="entertainment" 
              className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:rounded-none data-[state=active]:shadow-none h-full rounded-none"
            >
              <Music className="mr-2 size-4" />
              Entertainment
            </TabsTrigger>
          </TabsList>
          
          {/* Topic filters - only show on For You tab */}
          <div className="px-2 py-1 overflow-x-auto scrollbar-hide">
            <div className="no-scrollbar flex gap-2 overflow-x-auto py-2">
              {isLoadingTopics ? (
                // Show skeleton loaders while loading topics
                <>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-20 rounded-full" />
                  ))}
                </>
              ) : (
                // Show topics with trending indicators
                topics.map((t) => (
                  <Button
                    key={t.id}
                    variant={topic === t.id ? "default" : "outline"}
                    className="whitespace-nowrap rounded-full h-8 px-4"
                    asChild
                  >
                    <Link
                      href={{
                        query: {
                          ...(searchQuery ? { q: searchQuery } : {}),
                          ...(t.id === "all" ? {} : { topic: t.id }),
                        },
                      }}
                    >
                      {t.id !== "all" && t.trendingScore && (
                        <span className="mr-1 text-xs">🔥</span>
                      )}
                      {t.label}
                    </Link>
                  </Button>
                ))
              )}
            </div>
          </div>
        </div>
        
        {/* Search results info */}
        {searchQuery && (
          <div className="border-b border-border px-4 py-2 text-sm bg-muted/30">
            Showing results for:{" "}
            <span className="font-medium">{searchQuery}</span>
            <Button
              variant="link"
              className="ml-2 h-auto p-0 text-sm"
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.delete("q");
                router.push(`?${params.toString()}`);
              }}
            >
              Clear
            </Button>
          </div>
        )}

        <TabsContent value="for-you" className="mt-0 border-none p-0">
          <InfiniteScrollContainer
            className="no-scrollbar h-full overflow-y-auto"
            onBottomReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                void fetchNextPage();
              }
            }}
          >
            {posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.id} className="border-b border-border">
                  <Post post={post as unknown as PostData} />
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "No posts found matching your search criteria."
                    : "No posts found for this topic."}
                </p>
              </div>
            )}
            {isFetchingNextPage && (
              <div className="flex justify-center py-4">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </InfiniteScrollContainer>
        </TabsContent>
        
        <TabsContent value="trending" className="mt-0 border-none p-0">
          <div className="space-y-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border-b border-border p-4 hover:bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">Trending in Tech</div>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <span className="sr-only">More</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="19" cy="12" r="1" />
                      <circle cx="5" cy="12" r="1" />
                    </svg>
                  </Button>
                </div>
                <div className="font-semibold">Topic #{i + 1}</div>
                <div className="text-xs text-muted-foreground">{Math.floor(Math.random() * 10000)} posts</div>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="news" className="flex h-[300px] items-center justify-center border-none">
          <div className="text-center text-muted-foreground">
            <p>News content will be available soon</p>
          </div>
        </TabsContent>
        
        <TabsContent value="sports" className="flex h-[300px] items-center justify-center border-none">
          <div className="text-center text-muted-foreground">
            <p>Sports content will be available soon</p>
          </div>
        </TabsContent>
        
        <TabsContent value="entertainment" className="flex h-[300px] items-center justify-center border-none">
          <div className="text-center text-muted-foreground">
            <p>Entertainment content will be available soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
