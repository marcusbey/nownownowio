"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { Suspense } from "react";
import SearchField from "./SearchField";
import { TrendingTopicsSection } from "./trending-topics";
import { WhoToFollowSection } from "./who-to-follow";

export function TrendsSidebar() {
  const { data: session } = useSession();

  const { data: suggestions } = useQuery({
    queryKey: ["who-to-follow"],
    queryFn: async () => {
      const res = await fetch("/api/v1/posts/for-you/who-to-follow");
      if (!res.ok) {
        throw new Error("Failed to fetch who-to-follow");
      }
      return res.json();
    },
    select: (users: { id: string; name: string }[]) => {
      // Filter out current user
      return users.filter((u) => u.id !== session?.user?.id);
    },
  });

  return (
    <div className="sticky top-0 size-full overflow-y-auto px-4 py-6">
      {/* Search and Filters Section */}
      <div
        className="space-y-4 rounded-xl p-4
        shadow-sm ring-1 ring-primary/5 backdrop-blur"
      >
        <SearchField />
      </div>

      {/* Who to Follow Section */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground/50" />
          </div>
        }
      >
        <TrendingTopicsSection />
        <div className="mb-4 mt-6 border-b border-accent"></div>
        <WhoToFollowSection suggestions={suggestions} />
      </Suspense>
    </div>
  );
}
