import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/layout/sidebar";
import { RightSidebar } from "@/features/core/right-sidebar";
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
      <div className="flex mx-auto w-full max-w-[1440px]">
        {/* Left Sidebar */}
        <OrgSidebar slug={org.slug} roles={roles} userOrgs={userOrganizations} />
        
        {/* Main Content */}
        <div className="flex flex-1 justify-center">
          <SidebarInset className="w-[600px] min-h-screen border-x border-accent">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-accent px-4">
              <Layout>
                <SidebarTrigger className="-ml-1" />
              </Layout>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
          </SidebarInset>
        </div>

        {/* Right Sidebar */}
        <RightSidebar />
      </div>
    </SidebarProvider>
  );
}
