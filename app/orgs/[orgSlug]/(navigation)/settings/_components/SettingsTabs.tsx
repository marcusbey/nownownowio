"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, CreditCard, User, LayoutDashboard } from "lucide-react";

interface SettingsTab {
  id: string;
  label: string;
  href: string;
}

interface SettingsTabsProps {
  orgSlug: string;
  tabs: SettingsTab[];
}

export function SettingsTabs({ orgSlug, tabs }: SettingsTabsProps) {
  const pathname = usePathname();
  
  // Determine which tab is active based on the pathname
  const getActiveTab = (pathname: string) => {
    if (pathname.includes('/settings/billing') || pathname.includes('/settings/subscription')) {
      return 'plan';
    } else if (pathname.includes('/settings/account') || pathname.includes('/settings/members') || pathname.includes('/settings/danger')) {
      return 'account';
    } else if (pathname.includes('/settings/dashboard')) {
      return 'dashboard';
    } else {
      return 'general';
    }
  };
  
  const activeTab = getActiveTab(pathname);
  
  // Get the icon for each tab
  const getTabIcon = (tabId: string) => {
    switch (tabId) {
      case 'general':
        return Settings;
      case 'plan':
        return CreditCard;
      case 'account':
        return User;
      case 'dashboard':
        return LayoutDashboard;
      default:
        return Settings;
    }
  };

  return (
    <div className="border-b">
      <div className="flex h-10 items-center space-x-4">
        {tabs.map((tab) => {
          const Icon = getTabIcon(tab.id);
          const isActive = activeTab === tab.id;
          
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all relative",
                isActive 
                  ? "text-primary border-b-2 border-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
