import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/layout/sidebar";
import { TrendsSidebar } from "@/features/layout/right-sidebar";
import { Layout } from "@/features/page/layout";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";
import { getUsersOrgs } from "@/query/org/get-users-orgs.query";
import type { PropsWithChildren } from "react";
import { OrgSidebar } from "./org-sidebar";
import { SidebarToggleWrapper } from "./sidebar-toggle-wrapper";

export async function OrgNavigation({ children }: PropsWithChildren) {
  const { org, roles } = await getRequiredCurrentOrgCache();
  const userOrganizations = await getUsersOrgs();

  return (
    <SidebarProvider>
      {/* Main container with max-width for very large screens */}
      <SidebarToggleWrapper>
        {/* Left Sidebar */}
        <div
          id="left-sidebar"
          className="h-full w-1/4 min-w-[250px] overflow-y-auto transition-all duration-300 ease-in-out"
        >
          <OrgSidebar
            slug={org.slug}
            roles={roles}
            userOrgs={userOrganizations}
          />
        </div>

        {/* Main Content */}
        <div
          id="main-content"
          className="h-full flex-1 transition-all duration-300 ease-in-out"
        >
          <SidebarInset className="size-full overflow-y-auto border-x border-accent">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-accent px-4">
              <Layout>
                <SidebarTrigger className="-ml-1" />
              </Layout>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
          </SidebarInset>
        </div>

        {/* Right Sidebar */}
        <div className="h-full w-1/4 min-w-[250px] overflow-y-auto">
          <TrendsSidebar />
        </div>
      </SidebarToggleWrapper>
    </SidebarProvider>
  );
}

// Add server options
export const runtime = "edge";
export const dynamic = "force-dynamic";
