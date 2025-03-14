"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Code, Users, CreditCard, Wallet, AlertTriangle, User } from "lucide-react";

type SettingsLink = {
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  section: 'general' | 'plan' | 'account';
}

const settingsLinks: SettingsLink[] = [
  {
    href: "/settings",
    icon: Settings,
    label: "General",
    section: 'general'
  },
  {
    href: "/settings/widget",
    icon: Code,
    label: "Widget",
    section: 'general'
  },
  {
    href: "/settings/members",
    icon: Users,
    label: "Members",
    section: 'account'
  },
  {
    href: "/settings/subscription",
    icon: Wallet,
    label: "Subscription",
    section: 'plan'
  },
  {
    href: "/settings/billing",
    icon: CreditCard,
    label: "Billing",
    section: 'plan'
  },
  {
    href: "/settings/account",
    icon: User,
    label: "Account",
    section: 'account'
  },
  {
    href: "/settings/danger",
    icon: AlertTriangle,
    label: "Danger Zone",
    section: 'account'
  },
];

export function SettingsNavigation({ orgSlug, links }: { orgSlug: string; links: any[] }) {
  const pathname = usePathname();

  // Group links by section
  const sections = {
    general: settingsLinks.filter(link => link.section === 'general'),
    plan: settingsLinks.filter(link => link.section === 'plan'),
    account: settingsLinks.filter(link => link.section === 'account')
  };

  const renderSection = (title: string, sectionLinks: SettingsLink[]) => (
    <div className="mb-4">
      <h3 className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">{title}</h3>
      <div className="flex flex-col space-y-1">
        {sectionLinks.map((link) => {
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
              <link.icon className="size-4" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <nav className="w-64 shrink-0">
      {renderSection("General", sections.general)}
      {renderSection("Plan and Billing", sections.plan)}
      {renderSection("Account", sections.account)}
    </nav>
  );
}
