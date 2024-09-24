// Start of Selection
"use client";

import { isInRoles } from "@/lib/organizations/isInRoles";
import { NavigationLink } from "@/lib/types";
import { cn } from "@/lib/utils";
import { OrganizationMembershipRole } from "@prisma/client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ACCOUNT_LINKS } from "../../../../(logged-in)/(account-layout)/account-links";
import { ORGANIZATION_LINKS } from "./org-navigation.links";

const useCurrentPath = (links: NavigationLink[], organizationSlug?: string) => {
  const currentPath = usePathname()
    .replace(`:organizationSlug`, organizationSlug ?? "")
    .split("/")
    .filter(Boolean);

  const allLinks = links.flatMap((group) => group.links);
  const linkMatchCounts = allLinks.map((link) => {
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

  return mostMatchingLink.url || allLinks[0].href;
};

const NavigationLinkMapping = {
  organization: ORGANIZATION_LINKS,
  account: ACCOUNT_LINKS,
} as const;

type NavigationLinkMappingKey = keyof typeof NavigationLinkMapping;

export function NavigationLinks({
  variant,
  organizationSlug,
  roles: userRoles,
  links: linksKey,
}: {
  variant?: "default" | "mobile";
  organizationSlug?: string;
  roles?: OrganizationMembershipRole[];
  links: NavigationLinkMappingKey;
}) {
  const baseLinks = NavigationLinkMapping[linksKey];

  const currentPath = useCurrentPath(baseLinks, organizationSlug);

  const filteredLinks = userRoles
    ? baseLinks.map((group) => ({
        ...group,
        links: group.links.filter((link) =>
          link.roles ? isInRoles(userRoles, link.roles) : true,
        ),
      }))
    : baseLinks;

  if (variant === "mobile") {
    return (
      <nav className="grid gap-2 text-lg font-medium">
        {filteredLinks
          .flatMap((group) => group.links)
          .map((link, index) => {
            const Icon = link.icon as React.ComponentType<{
              className?: string;
            }>;
            return (
              <Link
                key={index}
                href={link.href.replaceAll(
                  ":organizationSlug",
                  organizationSlug ?? "",
                )}
                className={cn(
                  `mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2`,
                  {
                    "text-primary hover:text-primary":
                      currentPath === link.href,
                    "text-muted-foreground hover:text-foreground":
                      currentPath !== link.href,
                  },
                )}
              >
                <Icon className="size-5" />
                {link.label}
              </Link>
            );
          })}
      </nav>
    );
  }
  return (
    <>
      <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
        {filteredLinks.map((group, groupIndex) => (
          <div className="mb-4" key={groupIndex}>
            <h3 className="mb-2 mt-4 hidden text-xs font-semibold md:block">
              {group.title}
            </h3>
            {group.links.map((link, linkIndex) => {
              const Icon = link.icon as React.ComponentType<{
                className?: string;
              }>;
              return (
                <Link
                  key={linkIndex}
                  href={link.href.replaceAll(
                    ":organizationSlug",
                    organizationSlug ?? "",
                  )}
                  className={cn(
                    `flex items-center gap-3 rounded-lg px-3 py-2`,
                    {
                      "text-primary hover:text-primary":
                        currentPath === link.href,
                      "text-muted-foreground hover:text-foreground":
                        currentPath !== link.href,
                    },
                    "justify-center md:justify-start", // Center on small screens, start-aligned on larger screens
                  )}
                >
                  <Icon className="size-6 md:size-5" />{" "}
                  {/* Larger icons, especially on small screens */}
                  <span className="hidden text-base md:inline">
                    {link.label}
                  </span>{" "}
                  {/* Slightly larger text */}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </>
  );
}
