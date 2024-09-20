import { SiteConfig } from "@/site-config";
import { Bell, Bookmark, Coins, Compass, Home, LayoutDashboard, MailIcon, Settings, User2 } from "lucide-react";

const orgPath = `/orgs/:organizationSlug`;

export const ORGANIZATION_LINKS = [
  {
    title: "ACTIVITIES",
    links: [
      {
        href: '/',
        icon: Home,
        label: "Home",
      },
      {
        href: `${orgPath}/explore`,
        icon: Compass,
        label: "Explore",
      },
      {
        href: `${orgPath}/profile`,
        icon: User2,
        label: "Panel",
      },
      {
        href: `${orgPath}/notifications`,
        icon: Bell,
        label: "Notifications",
      },
      {
        href: `${orgPath}/bookmarks`,
        icon: Bookmark,
        label: "Bookmarks",
      },
      {
        href: `${orgPath}/messages`,
        icon: MailIcon,
        label: "Messages",
      },
    ],
  },
  {
    title: "SETTINGS",
    links: [
      {
        href: `${orgPath}/dashboard`,
        icon: LayoutDashboard,
        label: "Dashboard",
      },
      {
        href: `${orgPath}/billing`,
        icon: Coins,
        label: "Billing",
      },
      {
        href: SiteConfig.features.enableSingleMemberOrg
          ? "/account"
          : `${orgPath}/settings`,
        icon: Settings,
        label: "Settings",
        roles: ["ADMIN"],
      },
    ],
  },
];