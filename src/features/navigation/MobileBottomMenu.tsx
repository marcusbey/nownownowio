"use client";

import { ORGANIZATION_LINKS } from "@/app/orgs/[orgSlug]/navigation/_navigation/org-navigation.links";
import { cn } from "@/lib/utils";
import { Feather } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const useCurrentPath = () => {
  return usePathname();
};

export const MobileBottomMenu = ({ className }: { className?: string }) => {
  const currentPath = useCurrentPath();
  const menuItems = ORGANIZATION_LINKS[0].links.slice(0, 5);

  return (
    <nav
      className={cn(
        "w-full bg-background/80 backdrop-blur-lg border-t border-border shadow-lg",
        className,
      )}
    >
      <div className="flex h-16 items-center justify-around max-w-lg mx-auto">
        {menuItems.map((link) => {
          const isCurrent = currentPath === link.href;

          return (
            <Link
              key={link.href}
              className={cn(
                "flex flex-col items-center justify-center h-full w-full",
                "text-muted-foreground hover:text-foreground transition-colors",
                {
                  "text-primary font-medium": isCurrent,
                },
              )}
              href={link.href}
            >
              <div className={cn("h-6 w-6", { "text-primary": isCurrent })}>
                <link.icon />
              </div>
              <span className="mt-1 text-xs">{link.label}</span>
            </Link>
          );
        })}
        <Link
          href="/new-post"
          className="hover:text-primary-dark flex size-full flex-col items-center justify-center text-primary"
        >
          <Feather className="size-6" />
          <span className="mt-1 text-xs">New Post</span>
        </Link>
      </div>
    </nav>
  );
};
