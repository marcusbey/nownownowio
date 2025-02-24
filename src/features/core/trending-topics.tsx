"use client";

import { ENDPOINTS } from "@/lib/api/apiEndpoints";
import Skeleton from "@/components/core/skeleton";
import { formatNumber } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

type Topic = {
  id: string;
  label: string;
  count: number;
};

export function TrendingTopicsSection() {
  const { data = [], isLoading } = useQuery<Topic[]>({
    queryKey: ["trendingTopics"],
    queryFn: async () => {
      const response = await fetch(ENDPOINTS.TRENDING_TOPICS);
      if (!response.ok) throw new Error("Failed to fetch trending topics");
      return response.json();
    },
  });

  return (
    <div className="rounded-xl px-4 py-3">
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
        ) : data.length === 0 ? (
          <p className="px-2 text-muted-foreground">No trending topics yet</p>
        ) : (
          data.map((topic) => (
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
        )}
      </div>
    </div>
  );
}
