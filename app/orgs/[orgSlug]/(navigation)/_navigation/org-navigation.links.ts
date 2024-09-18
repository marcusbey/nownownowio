import { SiteConfig } from "@/site-config";
import { OrganizationMembershipRole } from "@prisma/client";
import { Bell, Bookmark, Coins, Compass, Home, LayoutDashboard, MailIcon, Settings, User2 } from "lucide-react";
import { NavigationLink } from "./OrgLinks";

const orgPath = `/orgs/:organizationSlug`;

export const ORGANIZATION_LINKS: NavigationLink[] = [
  {
    href: orgPath,
    icon: Home,
    label: "Home",
    group: "ACTIVITIES",
  },
  {
    href: `${orgPath}/explore`,
    icon: Compass,
    label: "Explore",
    group: "ACTIVITIES",
  },
  {
    href: `${orgPath}/profile`,
    icon: User2,
    label: "Panel",
    group: "ACTIVITIES",
  },
  {
    href: `${orgPath}/notifications`,
    icon: Bell,
    label: "Notifications",
    group: "ACTIVITIES",
  },
  {
    href: `${orgPath}/bookmarks`,
    icon: Bookmark,
    label: "Bookmarks",
    group: "ACTIVITIES",
  },
  {
    href: `${orgPath}/messages`,
    icon: MailIcon,
    label: "Messages",
    group: "ACTIVITIES",
  },
  {
    href: `${orgPath}/dashboard`,
    icon: LayoutDashboard,
    label: "Dashboard",
    group: "SETTINGS",
  },
  {
    href: `${orgPath}/billing`,
    icon: Coins,
    label: "Billing",
    group: "SETTINGS",
  },
  {
    href: SiteConfig.features.enableSingleMemberOrg
      ? "/account"
      : `${orgPath}/settings`,
    icon: Settings,
    label: "Settings",
    group: "SETTINGS",
    roles: [OrganizationMembershipRole.ADMIN],
  },
];
