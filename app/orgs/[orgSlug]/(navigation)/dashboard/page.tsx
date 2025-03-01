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

export default async function DashboardPage({
  params,
}: PageParams<{
  orgSlug: string;
}>) {
  const org = await getRequiredCurrentOrgCache();
  return (
    <Layout>
      <LayoutHeader>
        <LayoutTitle>Dashboard</LayoutTitle>
      </LayoutHeader>
      <LayoutActions>
        {isInRoles(org.roles, ["ADMIN", "OWNER"]) ? (
          <Link
            href={`/orgs/${params.orgSlug}/settings/members`}
            className={buttonVariants({ variant: "outline" })}
          >
            Invite member
          </Link>
        ) : null}
      </LayoutActions>
      <LayoutContent className="flex flex-col gap-4 lg:gap-8">
        <InformationCards />
        <SubscribersChart />
      </LayoutContent>
    </Layout>
  );
}
