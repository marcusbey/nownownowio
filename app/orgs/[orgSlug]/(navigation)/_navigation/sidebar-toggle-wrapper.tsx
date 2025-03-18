"use client";

import { useSidebar } from "@/components/layout/sidebar";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

type SidebarToggleWrapperProps = {
  children: [ReactNode, ReactNode, ReactNode?]; // Third child is optional
  className?: string;
};

export function SidebarToggleWrapper({
  children,
  className,
}: SidebarToggleWrapperProps) {
  // Use the sidebar context instead of local state
  const { open: sidebarOpen } = useSidebar();
  
  return (
    <div
      className={cn("mx-auto flex h-dvh w-full max-w-screen-2xl", className)}
    >
      {/* Left Sidebar - Apply classes based on state */}
      <div
        className={cn(
          "relative h-full overflow-y-auto transition-all duration-300 ease-in-out",
          sidebarOpen ? "w-[368px] min-w-[368px]" : "w-0 min-w-0 opacity-0",
        )}
        data-state={sidebarOpen ? "expanded" : "collapsed"}
      >
        {children[0]}
      </div>

      {/* Main Content Area - Fills the space between sidebars */}
      <div className="h-full min-w-0 flex-1">{children[1]}</div>

      {/* Right Sidebar - Optional */}
      {children[2] && (
        <div className="h-full w-[368px] overflow-y-auto">{children[2]}</div>
      )}
    </div>
  );
}
