import { orgMetadata } from "@/lib/metadata";
import { getCurrentOrgCache } from "@/lib/react/cache";
import type { PageParams } from "@/types/next";
import type { Metadata } from "next";
import { InjectCurrentOrgStore } from "./use-current-org";

export async function generateMetadata(
  { params }: PageParams<{ orgSlug: string }>,
): Promise<Metadata> {
  // Await params before using its properties
  const awaitedParams = await params;
  const slug = awaitedParams.orgSlug;
  return orgMetadata(slug);
}

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { orgSlug: string };
}) {
  // Await params before using its properties
  const awaitedParams = await params;
  const slug = awaitedParams.orgSlug;

  const org = await getCurrentOrgCache(slug);
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
