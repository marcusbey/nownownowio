import { orgMetadata } from "@/lib/metadata";
import { getCurrentOrgCache } from "@/lib/react/cache";
import type { PageParams } from "@/types/next";
import type { Metadata } from "next";
import { InjectCurrentOrgStore } from "./use-current-org";

export async function generateMetadata(
  props: PageParams<{ orgSlug: string }>,
): Promise<Metadata> {
  const orgSlug = props.params.orgSlug;
  return orgMetadata(orgSlug);
}

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { orgSlug: string };
}) {
  const orgSlug = params.orgSlug;

  const org = await getCurrentOrgCache(orgSlug);
  const orgData = org
    ? {
        id: org.id,
        slug: org.slug,
        name: org.name,
        image: org.image,
        plan: org.plan,
      }
    : undefined;

  return (
    <InjectCurrentOrgStore org={orgData}>
      <div className="min-h-screen bg-background">
        {children}
      </div>
    </InjectCurrentOrgStore>
  );
}
