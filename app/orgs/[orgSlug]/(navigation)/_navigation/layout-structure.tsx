"use client";

import { SidebarTrigger } from "@/components/layout/sidebar";
import { TrendsSidebar } from "@/features/layout/right-sidebar";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SidebarToggleWrapper } from "./sidebar-toggle-wrapper";

// Define styling constants for consistency
const SIDEBAR_BG_CLASS = "bg-zinc-900"; // equivalent to #19191c in Tailwind's color palette
const HEADER_BG_CLASS = "bg-zinc-900 border-zinc-800"; // Dark background for header
const MAIN_BG_CLASS = "bg-gradient-to-b from-background to-background/95 backdrop-blur-sm"; // Gradient background with blur

type LayoutStructureProps = {
  sidebar: ReactNode;
  children: ReactNode;
};

export function LayoutStructure({ sidebar, children }: LayoutStructureProps) {
  const pathname = usePathname();
  const hideRightSidebar =
    pathname.includes("/settings") || pathname.includes("/dashboard");

  return (
    <SidebarToggleWrapper className="w-full max-w-[100vw]">
      {/* Left Sidebar - Dark background */}
      <div className={`h-dvh w-full overflow-y-auto ${SIDEBAR_BG_CLASS}`}>{sidebar}</div>

      {/* Main Content - Dark background matching sidebars */}
      <div className="flex h-dvh min-w-0 flex-1 flex-col overflow-hidden">
        <header className={`sticky top-0 z-20 flex h-16 shrink-0 items-center border-b px-4 shadow-sm ${HEADER_BG_CLASS}`}>
          <div className="flex items-center">
            <SidebarTrigger className="size-8 text-foreground/80 hover:text-foreground transition-colors" />
          </div>
          <div className="flex-1"></div>
        </header>
        <main className={`flex-1 overflow-y-auto ${MAIN_BG_CLASS}`}>
          <div className="size-full p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Right Sidebar - Matching left sidebar background */}
      {!hideRightSidebar ? (
        <aside className={`h-dvh w-full shrink-0 overflow-y-auto border-l border-accent/10 ${SIDEBAR_BG_CLASS}`}>
          <div className="sticky top-0 w-full h-full">
            <TrendsSidebar />
          </div>
        </aside>
      ) : null}
    </SidebarToggleWrapper>
  );
}
