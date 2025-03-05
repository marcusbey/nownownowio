"use client";

import { ENDPOINTS } from "@/lib/api/apiEndpoints";
import Skeleton from "@/components/core/skeleton";
import { formatNumber } from "@/lib/utils";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Topic = {
  id: string;
  label: string;
  count: number;
};

export function TrendingTopicsSection() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const controllerRef = useRef<AbortController>();

  // Memoized fetch function
  const fetchTopics = useCallback(async () => {
    // Abort previous request if it exists
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();
    
    try {
      const response = await fetch(ENDPOINTS.TRENDING_TOPICS, {
        signal: controllerRef.current.signal
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch trending topics");
      }
      
      const data = await response.json();
      setTopics(data);
    } catch (err) {
      // Only log errors if not aborted
      if (controllerRef.current && !controllerRef.current.signal.aborted) {
        console.error('Trending topics error:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set up fetch with proper cleanup
  useEffect(() => {
    fetchTopics();
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchTopics, 300000);
    
    // Cleanup function to prevent memory leaks
    return () => {
      controllerRef.current?.abort();
      clearInterval(interval);
    };
  }, [fetchTopics]);

  // Memoize topic items to prevent unnecessary re-renders
  const memoizedTopics = useMemo(() => (
    topics.map((topic) => (
      <Link
        key={topic.id}
        href={`/search?q=${encodeURIComponent(topic.label)}`}
        className="px-2 transition-colors hover:bg-secondary"
      >
        <p className="line-clamp-1 break-all font-semibold hover:underline">
          {topic.label}
        </p>
        <p className="text-sm text-muted-foreground">
          {formatNumber(topic.count)}{" "}
          {topic.count === 1 ? "post" : "posts"}
        </p>
      </Link>
    ))
  ), [topics]);

  return (
    <div className="rounded-xl px-4 py-3 sticky top-4 space-y-4">
      <h2 className="mb-3 px-2 text-xl font-bold">Trending Topics</h2>
      <div className="flex flex-col gap-4">
        {isLoading ? (
          // Loading skeletons
          <>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex flex-col gap-2 px-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </>
        ) : topics.length === 0 ? (
          <p className="px-2 text-muted-foreground">No trending topics yet</p>
        ) : (
          memoizedTopics
        )}
      </div>
    </div>
  );
}
