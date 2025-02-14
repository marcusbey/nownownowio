import {
  HomeIcon,
  CompassIcon,
  UserIcon,
  BellIcon,
  BookmarkIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  PanelLeftIcon,
} from "lucide-react";
import type { NavigationGroup } from "./navigation.type";

export const mainNavigation: NavigationGroup[] = [
  {
    title: "ACTIVITIES",
    links: [
      {
        href: "/home",
        Icon: HomeIcon,
        label: "Home",
      },
      {
        href: "/explore",
        Icon: CompassIcon,
        label: "Explore",
      },
      {
        href: "/profile",
        Icon: UserIcon,
        label: "Profile",
      },
      {
        href: "/notifications",
        Icon: BellIcon,
        label: "Notifications",
      },
      {
        href: "/bookmarks",
        Icon: BookmarkIcon,
        label: "Bookmarks",
      },
    ],
  },
  {
    title: "SETTINGS",
    links: [
      {
        href: "/panel",
        Icon: PanelLeftIcon,
        label: "Panel",
      },
      {
        href: "/dashboard",
        Icon: LayoutDashboardIcon,
        label: "Dashboard",
      },
      {
        href: "/settings",
        Icon: SettingsIcon,
        label: "Settings",
      },
    ],
  },
];
