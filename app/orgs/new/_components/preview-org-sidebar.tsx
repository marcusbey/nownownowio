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
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";
import { ChevronDown } from "lucide-react";
import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";
import type {
  NavigationGroup,
  NavigationLink,
} from "../../../../src/features/navigation/navigation.type";

// Mock navigation data for preview
const previewNavigation: NavigationGroup[] = [
  {
    title: "Home",
    links: [
      {
        label: "Feed",
        icon: "Home",
        href: "#",
      },
      {
        label: "Explore",
        icon: "Globe",
        href: "#",
      },
    ],
  },
  {
    title: "Content",
    links: [
      {
        label: "Posts",
        icon: "FileText",
        href: "#",
      },
      {
        label: "Media",
        icon: "Image",
        href: "#",
      },
    ],
  },
  {
    title: "Organization",
    links: [
      {
        label: "Members",
        icon: "Users",
        href: "#",
      },
      {
        label: "Settings",
        icon: "Settings",
        href: "#",
      },
    ],
  },
];

export function PreviewOrgSidebar() {
  return (
    <Sidebar variant="inset" className="pointer-events-none shrink-0 opacity-80">
      <SidebarHeader className="flex flex-col gap-4 px-3 py-4">
        <div className="h-9 w-full animate-pulse rounded-md bg-accent/50" />
        <div className="h-9 w-full rounded-md bg-accent/50" />
      </SidebarHeader>
      <SidebarContent className="flex flex-col px-3">
        {previewNavigation.map((link) => (
          <ItemCollapsing key={link.title}>
            <SidebarGroup key={link.title} className="mb-3">
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-xs font-medium text-muted-foreground">
                  {link.title}
                  <ChevronDown className="size-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent className="mt-2 space-y-1">
                  <SidebarMenu>
                    {link.links.map((item: NavigationLink) => {
                      const Icon = Icons[
                        item.icon as keyof typeof Icons
                      ] as React.ComponentType<{ className?: string }>;

                      return (
                        <SidebarMenuItem key={item.label}>
                          <div className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm">
                            <Icon className="size-4 text-muted-foreground" />
                            <span>{item.label}</span>
                          </div>
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
        <div className="h-24 w-full rounded-md bg-accent/50" />
        <div className="h-10 w-full rounded-md bg-accent/50" />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function ItemCollapsing({ children }: PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="group/collapsible"
    >
      {children}
    </Collapsible>
  );
}
