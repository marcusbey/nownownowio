"use client";

import { NavigationLinks } from "@/features/core/navigation-links";
import type { NavigationGroup } from "@/features/core/navigation.type";
import {
  BarChart3,
  Bell,
  Bookmark,
  Compass,
  Home,
  LayoutDashboard,
  MessageSquare,
  PanelLeft,
  Settings,
  User,
  Users,
} from "lucide-react";
import * as React from "react";

const ORGANIZATION_PATH = `/orgs/:organizationSlug`;

const prependOrgPath = (href: string) => {
  return href.startsWith("/") ? `${ORGANIZATION_PATH}${href}` : href;
};

export const ORGANIZATION_LINKS: NavigationGroup[] = [
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
        icon: <Compass className="size-4" />,
        label: "Explore",
      },
      {
        href: prependOrgPath("/profile"),
        icon: <User className="size-4" />,
        label: "Profile",
      },
      {
        href: prependOrgPath("/notifications"),
        icon: <Bell className="size-4" />,
        label: "Notifications",
      },
      {
        href: prependOrgPath("/bookmarks"),
        icon: <Bookmark className="size-4" />,
        label: "Bookmarks",
      },
    ],
  },
  {
    title: "SETTINGS",
    links: [
      {
        href: prependOrgPath("/panel"),
        icon: <PanelLeft className="size-4" />,
        label: "Panel",
      },
      {
        href: prependOrgPath("/dashboard"),
        icon: <LayoutDashboard className="size-4" />,
        label: "Dashboard",
      },
      {
        href: prependOrgPath("/settings"),
        icon: <Settings className="size-4" />,
        label: "Settings",
      },
    ],
  },
];

export const orgNavigationLinks = [
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

export const IconComponents = {
  home: <Home className="size-4" />,
  compass: <Compass className="size-4" />,
  user: <User className="size-4" />,
  bell: <Bell className="size-4" />,
  bookmark: <Bookmark className="size-4" />,
  "panel-left": <PanelLeft className="size-4" />,
  "layout-dashboard": <LayoutDashboard className="size-4" />,
  settings: <Settings className="size-4" />,
  users: <Users className="size-4" />,
  "message-square": <MessageSquare className="size-4" />,
  "bar-chart-3": <BarChart3 className="size-4" />,
};

export function OrgNavigationLinks({
  navigation,
  className,
}: {
  navigation: NavigationGroup[];
  className?: string;
}) {
  const navigationWithIcons = React.useMemo(() => {
    return navigation.map((group) => ({
      ...group,
      links: group.links.map((link) => ({
        ...link,
        icon:
          typeof link.icon === "string"
            ? IconComponents[link.icon as keyof typeof IconComponents]
            : link.icon,
      })),
    }));
  }, [navigation]);

  return (
    <NavigationLinks navigation={navigationWithIcons} className={className} />
  );
}
