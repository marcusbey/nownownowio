"use client";

import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { Suspense, useEffect, useState } from "react";
import SearchField from "../core/SearchField";
import { TrendingTopicsSection } from "../core/trending-topics";
import { WhoToFollowSection } from "../core/who-to-follow";

export function TrendsSidebar() {
  // Configure useSession to not throw errors on unauthenticated
  const { status } = useSession({
    required: false,
    onUnauthenticated() {
      // Do nothing, let the component render normally
      console.log("User is not authenticated");
    },
  });

  // Use a separate state to track if we've mounted to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);

  // Only set mounted to true after the component has mounted on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Only consider authenticated on the client to avoid hydration mismatch
  const isAuthenticated = mounted && status === "authenticated";

  return (
    <div className="sticky top-0 size-full overflow-y-auto bg-transparent px-4 py-6">
      {/* Search and Filters Section */}
      <div
        className="space-y-4 rounded-xl bg-background/20
        p-4 shadow-sm ring-1 ring-primary/5 backdrop-blur-sm"
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
        {isAuthenticated && (
          <>
            <div className="mb-4 mt-6 border-b border-accent"></div>
            <WhoToFollowSection />
          </>
        )}
      </Suspense>
    </div>
  );
}
