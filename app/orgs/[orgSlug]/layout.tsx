import { RightSidebar } from "@/features/layout/right-sidebar";
import { NavigationLinks } from "@/features/navigation/navigation-links";
import { orgMetadata } from "@/lib/metadata";
import { getCurrentOrgCache } from "@/lib/react/cache";
import type { PageParams } from "@/types/next";
import type { Metadata } from "next";
import { getOrganizationNavigation } from "./(navigation)/_navigation/org-navigation.links";
import { InjectCurrentOrgStore } from "./use-current-org";

export async function generateMetadata(
  props: PageParams<{ orgSlug: string }>,
): Promise<Metadata> {
  const params = await props.params;
  return orgMetadata(params.orgSlug);
}

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { orgSlug: string };
}) {
  const { orgSlug } = await params;

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
        <aside className="sticky top-0 h-screen w-64 shrink-0 border-r border-border bg-card">
          <div className="flex h-full flex-col">
            <div className="flex items-center gap-2 p-4">
              <div className="flex size-8 items-center justify-center rounded-full bg-yellow-500 font-medium text-background">
                {org?.org.name[0] ?? "O"}
              </div>
              <span>{org?.org.name ?? "Organization"}</span>
            </div>
            <NavigationLinks
              navigation={getOrganizationNavigation(
                org?.org.slug ?? "",
                org?.roles,
              )}
            />
          </div>
        </aside>

        {/* Main Content */}
        <main className="min-w-0 flex-1">{children}</main>

        {/* Right Sidebar */}
        <RightSidebar>{null}</RightSidebar>
      </div>
    </InjectCurrentOrgStore>
  );
}
