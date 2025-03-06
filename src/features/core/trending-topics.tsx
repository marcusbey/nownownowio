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
    // Create a new controller for this specific request
    if (controllerRef.current) {
      // Only abort if we have an existing controller
      try {
        controllerRef.current.abort();
      } catch (e) {
        // Ignore abort errors
      }
    }
    
    // Create a new controller
    const controller = new AbortController();
    controllerRef.current = controller;
    
    try {
      const response = await fetch(ENDPOINTS.TRENDING_TOPICS, {
        signal: controller.signal
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch trending topics");
      }
      
      const data = await response.json();
      // Only update state if this controller is still the current one
      if (controllerRef.current === controller) {
        setTopics(data);
      }
    } catch (err) {
      // Only log errors if not aborted and this is the current controller
      if (err instanceof Error && err.name !== 'AbortError' && controllerRef.current === controller) {
        console.error('Trending topics error:', err);
      }
    } finally {
      if (controllerRef.current === controller) {
        setIsLoading(false);
      }
    }
  }, []);

  // Set up fetch with proper cleanup
  useEffect(() => {
    fetchTopics();
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchTopics, 300000);
    
    // Cleanup function to prevent memory leaks
    return () => {
      // Safely abort any in-flight requests
      if (controllerRef.current) {
        try {
          controllerRef.current.abort('Component unmounted');
        } catch (e) {
          // Ignore any errors during cleanup
        }
        // Clear the reference
        controllerRef.current = undefined;
      }
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
