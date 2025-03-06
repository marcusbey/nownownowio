import { SidebarProvider } from "@/components/layout/sidebar";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";
import { getUsersOrgs } from "@/query/org/get-users-orgs.query";
import type { PropsWithChildren } from "react";
import { OrgSidebar } from "./org-sidebar";

// Client component in a separate file to handle layout structure
import { LayoutStructure } from "./layout-structure";

export async function OrgNavigation({ children }: PropsWithChildren) {
  const { org, roles } = await getRequiredCurrentOrgCache();
  const userOrganizations = await getUsersOrgs();

  return (
    <SidebarProvider>
      <LayoutStructure
        sidebar={
          <OrgSidebar
            slug={org.slug}
            roles={roles}
            userOrgs={userOrganizations}
          />
        }
      >
        {children}
      </LayoutStructure>
    </SidebarProvider>
  );
}

// Add server options
export const runtime = "edge";
export const dynamic = "force-dynamic";
