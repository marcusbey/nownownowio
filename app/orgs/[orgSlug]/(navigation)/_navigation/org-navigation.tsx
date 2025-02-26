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

export async function OrgNavigation({ children }: PropsWithChildren) {
  const { org, roles } = await getRequiredCurrentOrgCache();
  const userOrganizations = await getUsersOrgs();

  return (
    <SidebarProvider>
      {/* Main container with max-width for very large screens */}
      <div className="flex h-[100dvh] w-full max-w-screen-2xl mx-auto">
        {/* Left Sidebar - 1/4 of space */}
        <div className="w-1/4 min-w-[250px] h-full overflow-y-auto">
          <OrgSidebar
            slug={org.slug}
            roles={roles}
            userOrgs={userOrganizations}
          />
        </div>

        {/* Main Content - 1/2 of space */}
        <div className="flex w-1/2 min-w-[600px] h-full">
          <SidebarInset className="h-full w-full border-x border-accent overflow-y-auto">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-accent px-4">
              <Layout>
                <SidebarTrigger className="-ml-1" />
              </Layout>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
          </SidebarInset>
        </div>

        {/* Right Sidebar - 1/4 of space */}
        <div className="w-1/4 min-w-[250px] h-full overflow-y-auto">
          <TrendsSidebar />
        </div>
      </div>
    </SidebarProvider>
  );
}
