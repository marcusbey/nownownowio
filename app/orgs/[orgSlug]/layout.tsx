import { orgMetadata } from "@/lib/metadata";
import { getCurrentOrgCache } from "@/lib/react/cache";
import type { LayoutParams, PageParams } from "@/types/next";
import type { Metadata } from "next";
import { InjectCurrentOrgStore } from "./use-current-org";
import { RightSidebar } from "@/features/layout/right-sidebar";
import { NavigationLinks } from "@/features/navigation/navigation-links";
import { getOrganizationNavigation } from "./(navigation)/_navigation/org-navigation.links";
import { Suspense } from "react";

export async function generateMetadata(
  props: PageParams<{ orgSlug: string }>,
): Promise<Metadata> {
  const params = await props.params;
  return orgMetadata(params.orgSlug);
}

export default async function RouteLayout(
  props: LayoutParams<{ orgSlug: string }>,
) {
  const org = await getCurrentOrgCache();
  const orgData = org?.org
    ? {
        id: org.org.id,
        slug: org.org.slug,
        name: org.org.name,
        image: org.org.image,
        plan: org.org.plan,
      }
    : undefined;

  return (
    <InjectCurrentOrgStore org={orgData}>
      <div className="flex min-h-screen bg-background">
        {/* Left Sidebar */}
        <aside className="w-64 shrink-0 border-r border-border h-screen sticky top-0 bg-card">
          <div className="flex flex-col h-full">
            <div className="p-4 flex items-center gap-2">
              <div className="size-8 rounded-full bg-yellow-500 flex items-center justify-center text-background font-medium">
                {org?.org?.name?.[0] ?? "O"}
              </div>
              <span>{org?.org?.name ?? "Organization"}</span>
            </div>
            <NavigationLinks 
              navigation={getOrganizationNavigation(
                org?.org?.slug ?? "",
                org?.membership?.roles
              )} 
            />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {props.children}
        </main>

        {/* Right Sidebar */}
        <RightSidebar />
      </div>
    </InjectCurrentOrgStore>
  );
}
