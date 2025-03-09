"use client";

import { SidebarProvider } from "@/components/layout/sidebar";
import type { getUsersOrgs } from "@/query/org/get-users-orgs.query";
import type { PropsWithChildren } from "react";
import { CustomLayoutStructure } from "./custom-layout-structure";
import { PreviewOrgSidebar } from "./preview-org-sidebar";

type NewOrgNavigationProps = PropsWithChildren<{
  userOrgs: Awaited<ReturnType<typeof getUsersOrgs>>;
}>

export function NewOrgNavigation({ children, userOrgs: _userOrgs }: NewOrgNavigationProps) {
  return (
    <SidebarProvider>
      <CustomLayoutStructure
        sidebar={<PreviewOrgSidebar />}
      >
        {children}
      </CustomLayoutStructure>
    </SidebarProvider>
  );
}
