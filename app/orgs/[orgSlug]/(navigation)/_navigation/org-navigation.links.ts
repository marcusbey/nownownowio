import type { OrganizationMembershipRole } from "@prisma/client";
import type { NavigationGroup } from "@/features/core/navigation.type";
import { isInRoles } from "@/lib/organizations/is-in-roles";

const replaceSlug = (href: string, slug: string) => {
  return href.replace(":organizationSlug", slug);
};

export const getOrganizationNavigation = (
  slug: string,
  userRoles: OrganizationMembershipRole[] | undefined,
): NavigationGroup[] => {
  return ORGANIZATION_LINKS.map((group: NavigationGroup) => {
    return {
      ...group,
      defaultOpenStartPath: group.defaultOpenStartPath
        ? replaceSlug(group.defaultOpenStartPath, slug)
        : undefined,
      links: group.links
        .filter((link) =>
          link.roles ? isInRoles(userRoles, link.roles) : true,
        )
        .map((link) => {
          return {
            ...link,
            href: replaceSlug(link.href, slug),
          };
        }),
    };
  });
};

const ORGANIZATION_PATH = `/orgs/:organizationSlug`;

const prependOrgPath = (href: string) => {
  return href.startsWith('/') ? `${ORGANIZATION_PATH}${href}` : href;
};

export const ORGANIZATION_LINKS: NavigationGroup[] = [
  {
    title: "ACTIVITIES",
    links: [
      {
        href: ORGANIZATION_PATH,
        icon: "home",
        label: "Home",
      },
      {
        href: prependOrgPath("/explore"),
        icon: "compass",
        label: "Explore",
      },
      {
        href: prependOrgPath("/profile"),
        icon: "user",
        label: "Profile",
      },
      {
        href: prependOrgPath("/notifications"),
        icon: "bell",
        label: "Notifications",
      },
      {
        href: prependOrgPath("/bookmarks"),
        icon: "bookmark",
        label: "Bookmarks",
      },
    ],
  },
  {
    title: "SETTINGS",
    links: [
      {
        href: prependOrgPath("/panel"),
        icon: "panel-left",
        label: "Panel",
        roles: ["OWNER", "ADMIN"],
      },
      {
        href: prependOrgPath("/dashboard"),
        icon: "layout-dashboard",
        label: "Dashboard",
        roles: ["OWNER", "ADMIN"],
      },
      {
        href: prependOrgPath("/settings"),
        icon: "settings",
        label: "Settings",
        roles: ["OWNER", "ADMIN"],
      },
    ],
  },
];

export const navigationLinks = [
  {
    href: "/",
    label: "Home",
    icon: "home",
  },
  {
    href: "/members",
    label: "Members",
    icon: "users",
  },
  {
    href: "/messages",
    label: "Messages",
    icon: "message-square",
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: "bar-chart-3",
  },
  {
    href: "/settings",
    label: "Settings",
    icon: "settings",
  },
];
