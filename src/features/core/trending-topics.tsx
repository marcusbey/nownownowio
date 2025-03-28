"use client";

import Skeleton from "@/components/core/skeleton";
import { ENDPOINTS } from "@/lib/api/apiEndpoints";
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
  const [hasError, setHasError] = useState(false);
  const controllerRef = useRef<AbortController>();
  const retryCount = useRef(0);
  const maxRetries = 3;

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

    // Reset error state when trying to fetch
    setHasError(false);

    // Create a new controller
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      console.log("Trending topics: Starting fetch");
      const response = await fetch(ENDPOINTS.TRENDING_TOPICS, {
        signal: controller.signal,
        method: "GET",
        credentials: "include", // Ensure cookies are sent for auth
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch trending topics: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      // Only update state if this controller is still the current one
      if (controllerRef.current === controller) {
        console.log("Trending topics: Data received", data);
        setTopics(data);
        // Reset retry count on success
        retryCount.current = 0;
      }
    } catch (err) {
      // Only handle errors if this controller is still the current one
      if (controllerRef.current === controller) {
        // Don't show error state for abort errors (these are expected during cleanup)
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Trending topics error:", err);
          setHasError(true);

          // Auto-retry logic (but not for 401 Unauthorized)
          if (retryCount.current < maxRetries && !err.message.includes("401")) {
            retryCount.current += 1;
            console.log(
              `Trending topics: Retrying (${retryCount.current}/${maxRetries})...`,
            );

            // Exponential backoff: 1s, 2s, 4s, etc.
            const backoffTime = Math.pow(2, retryCount.current - 1) * 1000;
            setTimeout(() => {
              fetchTopics();
            }, backoffTime);
          }
        }
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
          controllerRef.current.abort("Component unmounted");
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
  const memoizedTopics = useMemo(
    () =>
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
            {formatNumber(topic.count)} {topic.count === 1 ? "post" : "posts"}
          </p>
        </Link>
      )),
    [topics],
  );

  return (
    <div className="sticky top-4 space-y-4 rounded-xl px-4 py-3">
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
        ) : hasError ? (
          // Error state
          <div className="flex flex-col items-center px-2 py-3 text-center">
            <p className="text-sm text-destructive">
              Failed to load trending topics
            </p>
            <button
              className="mt-2 text-xs text-primary hover:underline"
              onClick={() => {
                setIsLoading(true);
                fetchTopics();
              }}
            >
              Retry
            </button>
          </div>
        ) : topics.length === 0 ? (
          <p className="px-2 text-muted-foreground">No trending topics yet</p>
        ) : (
          memoizedTopics
        )}
      </div>
    </div>
  );
}
