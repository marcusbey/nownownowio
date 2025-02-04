"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Code, Users, CreditCard, Wallet, AlertTriangle } from "lucide-react";

const settingsLinks = [
  {
    href: "/settings",
    icon: Settings,
    label: "General",
  },
  {
    href: "/settings/widget",
    icon: Code,
    label: "Widget",
  },
  {
    href: "/settings/members",
    icon: Users,
    label: "Members",
  },
  {
    href: "/settings/subscription",
    icon: Wallet,
    label: "Subscription",
  },
  {
    href: "/settings/billing",
    icon: CreditCard,
    label: "Billing",
  },
  {
    href: "/settings/danger",
    icon: AlertTriangle,
    label: "Danger Zone",
  },
] as const;

export function SettingsNavigation({ orgSlug }: { orgSlug: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col space-y-1">
      {settingsLinks.map((link) => {
        const href = `/orgs/${orgSlug}${link.href}`;
        const isActive = pathname === href;

        return (
          <Link
            key={link.href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
              isActive
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted text-muted-foreground"
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
