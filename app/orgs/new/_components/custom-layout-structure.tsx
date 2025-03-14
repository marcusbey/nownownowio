"use client";

import { SidebarTrigger } from "@/components/layout/sidebar";
import type { ReactNode } from "react";
import { SidebarToggleWrapper } from "../../../orgs/[orgSlug]/(navigation)/_navigation/sidebar-toggle-wrapper";
import { RotatingLogo } from "./rotating-logo";

// Define styling constants for consistency
const SIDEBAR_BG_CLASS = "bg-zinc-900"; // equivalent to #19191c in Tailwind's color palette
const HEADER_BG_CLASS = "bg-zinc-900 border-zinc-800"; // Dark background for header
const MAIN_BG_CLASS = "bg-gradient-to-b from-background to-background/95 backdrop-blur-sm"; // Gradient background with blur

type CustomLayoutStructureProps = {
  sidebar: ReactNode;
  children: ReactNode;
};

export function CustomLayoutStructure({ sidebar, children }: CustomLayoutStructureProps) {
  return (
    <SidebarToggleWrapper className="w-full max-w-[100vw]">
      {/* Left Sidebar - Dark background */}
      <div className={`h-dvh w-full overflow-y-auto ${SIDEBAR_BG_CLASS}`}>{sidebar}</div>

      {/* Main Content - Dark background matching sidebars */}
      <div className="relative flex h-dvh min-w-0 flex-1 flex-col overflow-hidden">
        {/* Positioned Rotating Logo */}
        <div className="absolute bottom-0 right-0 z-0">
          <RotatingLogo />
        </div>
        <header className={`sticky top-0 z-20 flex h-16 shrink-0 items-center border-b px-4 shadow-sm ${HEADER_BG_CLASS}`}>
          <div className="flex items-center">
            <SidebarTrigger className="size-8 text-foreground/80 transition-colors hover:text-foreground" />
          </div>
          <div className="flex-1"></div>
        </header>
        <main className={`flex-1 overflow-y-auto ${MAIN_BG_CLASS}`}>
          <div className="size-full p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
      
      {/* No right sidebar for the organization creation page */}
    </SidebarToggleWrapper>
  );
}
