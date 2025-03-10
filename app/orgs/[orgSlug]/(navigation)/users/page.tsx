import { Button } from "@/components/core/button";
import {
  Layout,
  LayoutActions,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import { combineWithParentMetadata } from "@/lib/metadata";
import type { PageParams } from "@/types/next";
import { ClientOrg } from "./client-org";
import { DonutChart } from "./donuts-chart";
import { UsersChart } from "./users-chart";

export const generateMetadata = combineWithParentMetadata({
  title: "Users",
  description: "Manage leads",
});

export default async function RoutePage(props: PageParams<{ orgSlug: string }>) {
  // In Next.js 15, we need to await the params object
  const awaitedParams = await props.params;
  const orgSlug = awaitedParams.orgSlug;
  return (
    <Layout>
      <LayoutHeader>
        <LayoutTitle>Demo Page</LayoutTitle>
      </LayoutHeader>
      <LayoutActions className="flex gap-2">
        <Button variant="outline">Delete</Button>
        <Button variant="default">Create</Button>
      </LayoutActions>
      <LayoutContent className="flex flex-col gap-4 lg:gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
          <UsersChart />
          <ClientOrg />
        </div>
        <DonutChart />
      </LayoutContent>
    </Layout>
  );
}
