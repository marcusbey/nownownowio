"use client";

import { Typography } from "@/components/data-display/typography";
import { cn } from "@/lib/utils";
import { LayoutGroup, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavigationGroup, NavigationLink } from "./navigation.type";
import * as Icons from "lucide-react";
import { useMemo } from "react";
import NotificationBadge from "@/features/core/notification-badge";

const useCurrentPath = (links: NavigationLink[]) => {
  const currentPath = usePathname().split("/").filter(Boolean);

  const linkMatchCounts = links.map((link) => {
    return {
      url: link.href,
      matchCount: link.href
        .split("/")
        .filter(Boolean)
        .filter((segment, index) => segment === currentPath[index]).length,
    };
  });

  const mostMatchingLink = linkMatchCounts.reduce(
    (maxMatchLink, currentLink) =>
      currentLink.matchCount > maxMatchLink.matchCount
        ? currentLink
        : maxMatchLink,
    { url: "", matchCount: 0 },
  );

  return mostMatchingLink.url || links[0].href;
};

const MotionLink = motion.create(Link);

export const NavigationLinks = ({
  navigation,
}: {
  navigation: NavigationGroup[];
}) => {
  const links = navigation
    .flatMap((group: NavigationGroup) => group.links)
    .filter((l) => !l.hidden);

  const currentPath = useCurrentPath(links);

  return (
    <LayoutGroup>
      <nav className="mt-4 grid items-start px-2 text-sm font-medium lg:px-4">
        {navigation.map(
          (group: NavigationGroup, groupIndex: number) =>
            group.links.length > 0 && (
              <div
                className="mb-6 flex flex-col gap-2 px-1"
                key={group.title + groupIndex}
              >
                <div className="group ml-2 flex items-center justify-between">
                  <Typography className="text-muted-foreground" variant="small">
                    {group.title}
                  </Typography>
                </div>
                {group.links.map((link: NavigationLink, index: number) => (
                  <MotionLink
                    key={index}
                    href={link.href}
                    className={cn(
                      `flex items-center transition gap-3 rounded-lg px-3 py-2 relative`,
                      "hover:bg-accent/20",
                      {
                        "text-muted-foreground hover:text-foreground":
                          currentPath !== link.href,
                      },
                    )}
                  >
                    {currentPath === link.href && (
                      <motion.div
                        layoutId={"motion-link"}
                        className="absolute inset-0 rounded-lg bg-accent"
                      ></motion.div>
                    )}
                    <div className="relative flex w-full items-center gap-x-1.5 text-left">
                      <div className="relative">
                        {(() => {
                          const Icon = Icons[link.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
                          return Icon ? <Icon className="size-4" /> : null;
                        })()}
                        {link.label === "Notifications" && <NotificationBadge />}
                      </div>
                      {link.label}
                    </div>
                  </MotionLink>
                ))}
              </div>
            ),
        )}
      </nav>
    </LayoutGroup>
  );
};
