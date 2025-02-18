import { BarChart3, Home, MessageSquare, Settings, Users } from "lucide-react";
import * as React from "react";

type NavigationLink = {
  href: string;
  label: string;
  icon: React.ReactNode;
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
