"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavigationGroup } from "./types";

type NavigationLinksProps = {
  navigation: NavigationGroup[];
  className?: string;
};

export function NavigationLinks({
  navigation,
  className,
}: NavigationLinksProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col gap-4", className)}>
      {navigation.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-1">
          {group.title && (
            <h2 className="px-2 text-xs font-semibold text-muted-foreground">
              {group.title}
            </h2>
          )}
          <div className="flex flex-col gap-1">
            {group.links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {link.icon}
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
