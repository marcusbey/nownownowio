import { buttonVariants } from "@/components/core/button";
import {
  Layout,
  LayoutActions,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import { isInRoles } from "@/lib/organizations/is-in-roles";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";
import type { PageParams } from "@/types/next";
import Link from "next/link";
import InformationCards from "../InformationCards";
import { SubscribersChart } from "../subscribers-charts";
import { WidgetSetupBanner } from "@/components/feedback/widget-setup-banner";
import { getWidgetSetupStatusQuery } from "../../../../../src/query/widget/widget-setup-status.query";

export default async function DashboardPage({
  params,
}: PageParams<{
  orgSlug: string;
}>) {
  // In Next.js 15, we need to await the params object
  const awaitedParams = await params;
  const orgSlug = awaitedParams.orgSlug;
  
  const orgData = await getRequiredCurrentOrgCache(orgSlug);
  
  // Check if the widget has been set up
  const widgetSetupStatus = await getWidgetSetupStatusQuery(orgData.org.id);
  const showWidgetSetupBanner = !widgetSetupStatus.isConfigured && isInRoles(orgData.roles, ["ADMIN", "OWNER"]);
  
  return (
    <Layout>
      <LayoutHeader>
        <LayoutTitle>Dashboard</LayoutTitle>
      </LayoutHeader>
      <LayoutActions>
        {isInRoles(orgData.roles, ["ADMIN", "OWNER"]) ? (
          <Link
            href={`/orgs/${orgSlug}/settings/members`}
            className={buttonVariants({ variant: "outline" })}
          >
            Invite member
          </Link>
        ) : null}
      </LayoutActions>
      <LayoutContent className="flex flex-col gap-4 lg:gap-8">
        {showWidgetSetupBanner && (
          <WidgetSetupBanner orgSlug={orgSlug} />
        )}
        <InformationCards />
        <SubscribersChart />
      </LayoutContent>
    </Layout>
  );
}
