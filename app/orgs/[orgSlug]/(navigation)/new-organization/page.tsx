import { Suspense } from "react";
import type { PageParams } from "@/types/next";
import NewOrganizationContent from "./new-organization-content";
import { combineWithParentMetadata } from "@/lib/metadata";
import NewOrgSkeleton from "./new-org-skeleton";

export const generateMetadata = combineWithParentMetadata({
  title: "Create New Organization",
  description: "Create a new organization in your NowNowNow account",
});

export default async function NewOrganizationPage({ params }: PageParams<{ orgSlug: string }>) {
  // Next.js 15+ requires awaiting params
  const awaitedParams = await params;
  const orgSlug = awaitedParams.orgSlug;
  
  return (
    <Suspense fallback={<NewOrgSkeleton />}>
      <NewOrganizationContent orgSlug={orgSlug} />
    </Suspense>
  );
}
