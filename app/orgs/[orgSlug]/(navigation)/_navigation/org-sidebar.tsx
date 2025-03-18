"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/data-display/collapsible";
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
import { SidebarUserButton } from "@/features/ui/sidebar/sidebar-user-button";
import { cn } from "@/lib/utils";
import type { OrganizationMembershipRole } from "@prisma/client";
import * as Icons from "lucide-react";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";
import type {
  NavigationGroup,
  NavigationLink,
} from "../../../../../src/features/navigation/navigation.type";
import { OrgCommand } from "./org-command";
import { getOrganizationNavigation } from "./org-navigation.links";
import { OrgsSelect } from "./orgs-select";
import { UpgradeCard } from "./upgrade-org-card";

export function OrgSidebar({
  slug,
  userOrgs,
  roles,
}: {
  slug: string;
  roles: OrganizationMembershipRole[] | undefined;
  userOrgs: {
    id: string;
    slug: string;
    name: string;
    image: string | null;
  }[];
}) {
  const links: NavigationGroup[] = getOrganizationNavigation(slug, roles);
  const pathname = usePathname();

  return (
    <Sidebar variant="inset" className="!visible !block shrink-0" data-testid="org-sidebar">
      <SidebarHeader className="flex flex-col gap-4 px-3 py-4">
        <OrgsSelect orgs={userOrgs} currentOrgSlug={slug} />
        <OrgCommand />
      </SidebarHeader>
      <SidebarContent className="flex flex-col px-3">
        {links.map((link) => (
          <ItemCollapsing
            defaultOpenStartPath={link.defaultOpenStartPath}
            key={link.title}
          >
            <SidebarGroup key={link.title} className="mb-3">
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-xs font-medium text-muted-foreground hover:text-foreground">
                  {link.title}
                  <ChevronDown className="size-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent className="mt-2 space-y-1">
                  <SidebarMenu>
                    {link.links.map((item: NavigationLink) => {
                      const isActive =
                        pathname === item.href ||
                        pathname.startsWith(`${item.href}/`);
                      const Icon = Icons[
                        item.icon as keyof typeof Icons
                      ] as React.ComponentType<{ className?: string }>;

                      // Skip rendering if hidden
                      if (item.hidden) return null;

                      return (
                        <SidebarMenuItem key={item.label}>
                          <SidebarMenuButtonLink
                            href={item.disabled ? "#" : item.href}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm",
                              item.disabled 
                                ? "cursor-not-allowed opacity-50" 
                                : "hover:bg-accent"
                            )}
                            onClick={item.disabled ? (e) => e.preventDefault() : undefined}
                          >
                            <Icon
                              className={cn(
                                "size-4",
                                isActive
                                  ? "text-primary"
                                  : "text-muted-foreground",
                              )}
                            />
                            <span>
                              {item.label}
                              {item.disabled && " (Coming Soon)"}
                            </span>
                          </SidebarMenuButtonLink>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </ItemCollapsing>
        ))}
      </SidebarContent>
      <SidebarFooter className="mt-auto flex flex-col gap-4 p-4">
        <UpgradeCard />
        <div className="sidebar-user-button-wrapper">
          {/* Debug log for SidebarUserButton */}
          <SidebarUserButton />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

const ItemCollapsing = (
  props: PropsWithChildren<{ defaultOpenStartPath?: string }>,
) => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isOpen = props.defaultOpenStartPath
    ? pathname.startsWith(props.defaultOpenStartPath)
    : true;

  useEffect(() => {
    if (isOpen) {
      setOpen(isOpen);
    }
  }, [isOpen]);

  return (
    <Collapsible
      defaultOpen={isOpen}
      onOpenChange={setOpen}
      open={open}
      className="group/collapsible"
    >
      {props.children}
    </Collapsible>
  );
};
