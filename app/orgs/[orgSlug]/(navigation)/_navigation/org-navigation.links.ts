import type { NavigationGroup, NavigationLink } from "@/features/navigation/navigation.type";
import { isInRoles } from "@/lib/organizations/is-in-roles";
import type { OrganizationMembershipRole } from "@prisma/client";

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
  // Activities section
  {
    title: "ACTIVITIES",
    links: [
      {
        href: ORGANIZATION_PATH,
        icon: "Home",
        label: "Home",
      },
      {
        href: prependOrgPath("/explore"),
        icon: "Compass",
        label: "Explore",
      },
      {
        href: prependOrgPath("/profile"),
        icon: "User",
        label: "Profile",
      },
      {
        href: prependOrgPath("/notifications"),
        icon: "Bell",
        label: "Notifications",
      },
      {
        href: prependOrgPath("/bookmarks"),
        icon: "Bookmark",
        label: "Bookmarks",
      },
    ],
  },
  {
    title: "SETTINGS",
    links: [
      {
        href: prependOrgPath("/panel"),
        icon: "PanelLeft",
        label: "Panel",
        roles: ["OWNER", "ADMIN"],
        disabled: true,
      },
      {
        href: prependOrgPath("/dashboard"),
        icon: "LayoutDashboard",
        label: "Dashboard",
        roles: ["OWNER", "ADMIN"],
        disabled: true,
      },
      // New Organization link removed - now available in settings/organization
      {
        href: prependOrgPath("/settings"),
        icon: "Settings",
        label: "Settings",
        roles: ["OWNER", "ADMIN"],
      },
    ],
  },
];

export const navigationLinks: NavigationLink[] = [
  // Main navigation links
  {
    href: "/",
    label: "Home",
    icon: "Home",
  },
  {
    href: "/members",
    label: "Members",
    icon: "Users",
  },
  {
    href: "/messages",
    label: "Messages",
    icon: "MessageSquare",
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: "BarChart3",
  },
  {
    href: "/settings",
    label: "Settings",
    icon: "Settings",
  },
];
