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

interface SettingsNavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
}

interface SettingsNavGroup {
  title: string;
  items: SettingsNavItem[];
}

interface SettingsSidebarProps {
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
          label: "General",
          href: `${basePath}`,
          icon: Settings
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
      title: "Account",
      items: [
        {
          id: "account",
          label: "Account",
          href: `${basePath}/account`,
          icon: User
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
    <div className={cn("w-64 shrink-0 border-r pr-6", className)}>
      {navGroups.map((group, index) => (
        <div key={index} className="mb-6">
          <h3 className="mb-2 text-sm font-medium text-muted-foreground">
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
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all",
                    active 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
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
