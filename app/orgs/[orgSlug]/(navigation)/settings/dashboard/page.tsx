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

export default async function RoutePage(
  props: PageParams<{
    orgSlug: string;
  }>,
) {
  // In Next.js 15, params is a Promise that needs to be properly awaited
  const params = await props.params;
  const orgSlug = params.orgSlug;
  const org = await getRequiredCurrentOrgCache(orgSlug);
  return (
    <Layout>
      <LayoutHeader>
        <LayoutTitle>Dashboard</LayoutTitle>
      </LayoutHeader>
      <LayoutActions>
        {isInRoles(org.roles, ["ADMIN"]) ? (
          <Link
            href={`/orgs/${orgSlug}/settings/members`}
            className={buttonVariants({ variant: "outline" })}
          >
            Invite member
          </Link>
        ) : null}
      </LayoutActions>
      <LayoutContent className="flex flex-col gap-4 lg:gap-8">
        {/* Information cards will be added here */}
        {/* Subscribers chart will be added here */}
      </LayoutContent>
    </Layout>
  );
}
