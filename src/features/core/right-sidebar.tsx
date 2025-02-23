

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import SearchField from "./SearchField";
import { WhoToFollowSection } from "./who-to-follow";
import { TrendingTopicsSection } from "./trending-topics";

export function TrendsSidebar() {
  return (
    <div className="sticky top-[5.25rem] h-fit w-full space-y-6">
      {/* Search and Filters Section */}
      <div
        className="space-y-4 rounded-xl bg-card/30 p-4 
        shadow-sm ring-1 ring-primary/5 backdrop-blur supports-[backdrop-filter]:bg-card/20"
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
        <WhoToFollowSection />
        <TrendingTopicsSection />
      </Suspense>
    </div>
  );
}
