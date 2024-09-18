"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, cloneElement } from "react";
import type { NavigationLinkGroups } from "./navigation.type";

const useCurrentPath = (links: NavigationLinkGroups[]) => {
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
    { url: "", matchCount: 0 }
  );

  return mostMatchingLink.url;
};

export const MobileBottomMenu = ({
  links,
  className,
}: {
  links: NavigationLinkGroups[];
  className?: string;
}) => {
  const currentPath = useCurrentPath(links);

  return (
    <nav className={cn("w-full sticky bottom-0", className)}>
      {links.map((section, index) => (
        <Fragment key={index}>
          <div className="flex justify-around">
            {section.links.map((link) => {
              const isCurrent = currentPath === link.url;

              return (
                <Link
                  key={link.url}
                  className={cn(
                        "flex h-8 items-center gap-2 rounded-md px-2 text-sm transition-colors",
                        "hover:bg-gray-100 text-gray-700", // Default styles
                        {
                          "bg-blue-500 hover:bg-blue-600": isCurrent, // Active styles
                        }
                      )}
                  href={link.url}
                >
                  {cloneElement(link.icon, {
                    className: "h-4 w-4",
                  })}
                  <span className="lg:flex hidden h-8 items-center gap-2 rounded-md px-2 text-sm ">
                    {link.title}
                  </span>
                </Link>
              );
            })}
          </div>
        </Fragment>
      ))}
    </nav>
  );
};
