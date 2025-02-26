"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/layout/sidebar";
import { SidebarMenuButtonLink } from "@/components/layout/sidebar-utils";
import type { NavigationGroup } from "@/features/navigation/navigation.type";
import { SidebarUserButton } from "@/features/ui/sidebar/sidebar-user-button";
import { ChevronDown } from "lucide-react";
import * as Icons from "lucide-react";
import { OrgsSelect } from "../../orgs/[orgSlug]/(navigation)/_navigation/orgs-select";
import { getAccountNavigation } from "./account.links";

export function AccountSidebar({
  userOrgs,
}: {
  userOrgs: {
    id: string;
    slug: string;
    name: string;
    image: string | null;
  }[];
}) {
  const links: NavigationGroup[] = getAccountNavigation();

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <OrgsSelect orgs={userOrgs} />
      </SidebarHeader>
      <SidebarContent>
        {links.map((link) => (
          <SidebarGroup key={link.title}>
            <SidebarGroupLabel>
              {link.title}
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {link.links.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButtonLink href={item.href}>
                      {(() => {
                        if (typeof item.Icon === 'function') {
                          const IconComponent = item.Icon;
                          return <IconComponent className="size-4" />;
                        } else if (typeof item.icon === 'string') {
                          const Icon = Icons[item.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
                          return Icon ? <Icon className="size-4" /> : null;
                        }
                        return null;
                      })()}
                      <span>{item.label}</span>
                    </SidebarMenuButtonLink>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="flex flex-col gap-2">
        <SidebarUserButton />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
