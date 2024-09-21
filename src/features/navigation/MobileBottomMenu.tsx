"use client";

import { cn } from "@/lib/utils";
import { Feather } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cloneElement } from "react";
import type { NavigationLinkGroups } from "./navigation.type";

const useCurrentPath = (links: NavigationLinkGroups[] = []) => {
  const currentPath = usePathname();
  const pathSegments = currentPath.split("/");
  const allDashboardLinks = links.flatMap((section) => section.links);

  const linkMatchCounts = allDashboardLinks.map((link) => ({
    url: link.url,
    matchCount: link.url
      .split("/")
      .filter((segment, index) => segment === pathSegments[index]).length,
  }));

  const mostMatchingLink = linkMatchCounts.reduce(
    (maxMatchLink, currentLink) =>
      currentLink.matchCount > maxMatchLink.matchCount
        ? currentLink
        : maxMatchLink,
    { url: "", matchCount: 0 },
  );

  return mostMatchingLink.url;
};

export const MobileBottomMenu = ({
  links = [],
  className,
}: {
  links?: NavigationLinkGroups[];
  className?: string;
}) => {
  const currentPath = useCurrentPath(links);

  return (
    <nav
      className={cn(
        "w-full sticky bottom-0 bg-background border-t border-border",
        className,
      )}
    >
      <div className="flex h-16 items-center justify-around">
        {links.flatMap((section) =>
          section.links.map((link) => {
            const isCurrent = currentPath === link.url;

            return (
              <Link
                key={link.url}
                className={cn(
                  "flex flex-col items-center justify-center h-full w-full",
                  "text-muted-foreground hover:text-foreground",
                  {
                    "text-primary": isCurrent,
                  },
                )}
                href={link.url}
              >
                {cloneElement(link.icon, {
                  className: cn("h-6 w-6", { "text-primary": isCurrent }),
                })}
                <span className="mt-1 text-xs">{link.title}</span>
              </Link>
            );
          }),
        )}
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
