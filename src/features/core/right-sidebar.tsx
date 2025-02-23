

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import SearchField from "./SearchField";
import { WhoToFollowSection } from "./who-to-follow";
import { TrendingTopicsSection } from "./trending-topics";

export function TrendsSidebar() {
  return (
    <div className="sticky top-0 h-full w-full px-4 py-6 overflow-y-auto">
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
        <WhoToFollowSection />
      </Suspense>
    </div>
  );
}
