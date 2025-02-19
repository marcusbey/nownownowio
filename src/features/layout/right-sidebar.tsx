import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type RightSidebarProps = {
  children: ReactNode;
  className?: string;
};

export function RightSidebar({ children, className }: RightSidebarProps) {
  return (
    <aside
      className={cn(
        "sticky top-0 h-screen w-80 shrink-0 border-l p-4",
        className,
      )}
    >
      {children}
    </aside>
  );
}
