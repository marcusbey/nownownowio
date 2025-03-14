"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Settings, 
  CreditCard, 
  User, 
  AlertTriangle, 
  BarChart, 
  Code
} from "lucide-react";

type SettingsNavItem = {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
}

type SettingsNavGroup = {
  title: string;
  items: SettingsNavItem[];
}

type SettingsSidebarProps = {
  orgSlug: string;
  className?: string;
}

export function SettingsSidebar({ orgSlug, className }: SettingsSidebarProps) {
  const pathname = usePathname();
  const basePath = `/orgs/${orgSlug}/settings`;
  
  const navGroups: SettingsNavGroup[] = [
    {
      title: "General",
      items: [
        {
          id: "general",
          label: "Personal Account",
          href: `${basePath}`,
          icon: User
        },
        {
          id: "widget",
          label: "Widget",
          href: `${basePath}/widget`,
          icon: Code
        }
      ]
    },
    {
      title: "Billing",
      items: [
        {
          id: "plan",
          label: "Plan",
          href: `${basePath}/plan`,
          icon: BarChart
        },
        {
          id: "billing",
          label: "Billing",
          href: `${basePath}/billing`,
          icon: CreditCard
        }
      ]
    },
    {
      title: "Organization",
      items: [
        {
          id: "organization",
          label: "Organization",
          href: `${basePath}/organization`,
          icon: Settings
        },
        {
          id: "members",
          label: "Members",
          href: `${basePath}/members`,
          icon: User
        },
        {
          id: "danger",
          label: "Danger Zone",
          href: `${basePath}/danger`,
          icon: AlertTriangle
        }
      ]
    }
  ];

  const isActive = (href: string) => {
    if (href === basePath) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className={cn("w-64 shrink-0 border-r border-r-accent/10 pr-6", className)}>
      {navGroups.map((group, index) => (
        <div key={index} className="mb-6">
          <h3 className="mb-2 text-sm font-medium tracking-wide text-muted-foreground/90">
            {group.title}
          </h3>
          <nav className="space-y-1">
            {group.items.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                    active 
                      ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary shadow-sm" 
                      : "text-muted-foreground hover:bg-accent/5 hover:text-foreground hover:translate-x-0.5"
                  )}
                >
                  <Icon className={cn("h-4 w-4 transition-transform", active ? "text-primary" : "text-muted-foreground/70")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      ))}
    </div>
  );
}
