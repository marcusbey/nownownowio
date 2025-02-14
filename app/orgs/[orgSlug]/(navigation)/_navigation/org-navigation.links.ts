import type {
  NavigationGroup,
  NavigationLink,
} from "@/features/navigation/navigation.type";
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
        .filter((link: NavigationLink) =>
          link.roles ? isInRoles(userRoles, link.roles) : true,
        )
        .map((link: NavigationLink) => {
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

export const ORGANIZATION_LINKS = [
  // Note: these links will be transformed by getOrganizationNavigation
  {
    title: "ACTIVITIES",
    links: [
      {
        href: prependOrgPath("/home"),
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
      },
      {
        href: prependOrgPath("/dashboard"),
        icon: "layout-dashboard",
        label: "Dashboard",
      },
      {
        href: prependOrgPath("/settings"),
        icon: "settings",
        label: "Settings",
      },
    ],
  },
] satisfies NavigationGroup[];
