import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/layout/sidebar";
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
      <div className="mx-auto flex w-full max-w-7xl justify-center">
        {/* Left Sidebar */}
        <OrgSidebar slug={org.slug} roles={roles} userOrgs={userOrganizations} />
        
        {/* Main Content */}
        <SidebarInset className="min-h-screen w-full max-w-2xl border-x border-accent">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-accent px-4">
            <Layout>
              <SidebarTrigger className="-ml-1" />
            </Layout>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
        </SidebarInset>

        {/* Right Sidebar */}
        <div className="hidden w-[350px] flex-col gap-4 p-4 lg:flex">
          <div className="rounded-lg border border-accent p-4">
            <h3 className="mb-4 font-semibold">Who to follow</h3>
            {/* Add UserSuggestions component here */}
          </div>
          <div className="rounded-lg border border-accent p-4">
            <h3 className="mb-4 font-semibold">Trending</h3>
            {/* Add TrendingTopics component here */}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
