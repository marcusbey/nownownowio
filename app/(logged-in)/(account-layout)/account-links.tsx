import { NavigationLink } from "@/lib/types";
import { AlertCircle, Mail, User2 } from "lucide-react";

export const ACCOUNT_LINKS: NavigationLink[] = [
  {
    title: "ACCOUNT",
    links: [
      {
        href: "/account",
        icon: User2,
        label: "Profile",
      },
      {
        href: "/account/email",
        icon: Mail,
        label: "Mail",
      },
      {
        href: "/account/danger",
        icon: AlertCircle,
        label: "Danger",
      },
    ],
  },
];
