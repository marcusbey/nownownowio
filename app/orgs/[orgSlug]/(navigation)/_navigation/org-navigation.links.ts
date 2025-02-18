import type {
  NavigationGroup,
  NavigationLink,
} from "@/features/navigation/navigation.type";
import { isInRoles } from "@/lib/organizations/is-in-roles";
import type { OrganizationMembershipRole } from "@prisma/client";
import {
  BarChart3,
  Home,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";


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
        href: ORGANIZATION_PATH,
        icon: <Home className="size-4" />,
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
        icon: <Settings className="size-4" />,
        label: "Settings",
      },
    ],
  },
] satisfies NavigationGroup[];

type NavigationLink = {
  href: string;
  label: string;
  icon: ReactNode;
};

export const orgNavigationLinks: NavigationLink[] = [
  {
    href: "/",
    label: "Home",
    icon: <Home className="size-4" />,
  },
  {
    href: "/members",
    label: "Members",
    icon: <Users className="size-4" />,
  },
  {
    href: "/messages",
    label: "Messages",
    icon: <MessageSquare className="size-4" />,
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: <BarChart3 className="size-4" />,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: <Settings className="size-4" />,
  },
];
