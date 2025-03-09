"use client";

import { SidebarProvider } from "@/components/layout/sidebar";
import type { getUsersOrgs } from "@/query/org/get-users-orgs.query";
import type { PropsWithChildren } from "react";
import { LayoutStructure } from "../../[orgSlug]/(navigation)/_navigation/layout-structure";
import { PreviewOrgSidebar } from "./preview-org-sidebar";

type NewOrgNavigationProps = PropsWithChildren<{
  userOrgs: Awaited<ReturnType<typeof getUsersOrgs>>;
}>

export function NewOrgNavigation({ children, userOrgs: _userOrgs }: NewOrgNavigationProps) {
  return (
    <SidebarProvider>
      <LayoutStructure
        sidebar={<PreviewOrgSidebar />}
      >
        {children}
      </LayoutStructure>
    </SidebarProvider>
  );
}
