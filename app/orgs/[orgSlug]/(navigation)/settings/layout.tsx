import {
  Layout,
  LayoutContent,
  LayoutDescription,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import { createSearchParamsMessageUrl } from "@/features/searchparams-message/createSearchParamsMessageUrl";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";
import { getServerUrl } from "@/lib/server-url";
import { SiteConfig } from "@/site-config";
import type { LayoutParams } from "@/types/next";
import type { OrganizationMembershipRole } from "@prisma/client";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SettingsTabs } from "./_components/SettingsTabs";

// Update the generateMetadata function
export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: "Settings",
    description: "Manage your organization settings.",
  };
};

export default async function RouteLayout(
  props: LayoutParams<{ orgSlug: string }>,
) {
  // Properly await the params Promise
  const params = props.params;
  const orgSlug = params.orgSlug;

  try {
    const { org } = await getRequiredCurrentOrgCache(orgSlug);

    // Fix the memberships access - use members instead and define proper typing
    const roles = org.members
      .map((member: { roles: OrganizationMembershipRole[] }) => member.roles)
      .flat();

    // Now use the awaited param
    const orgPath = `/orgs/${orgSlug}`;

    if (SiteConfig.features.enableSingleMemberOrg) {
      // Fix the createSearchParamsMessageUrl type issue by using string template
      redirect(
        createSearchParamsMessageUrl(
          `${getServerUrl()}org/${orgSlug}`,
          "type=message&message=You need to update your account settings.",
        ),
      );
    }

    return (
      <Layout>
        <LayoutHeader className="py-4">
          <LayoutTitle>Organization</LayoutTitle>
          <LayoutDescription className="text-sm">
            The organization is the hub for your billing, members, and more.
          </LayoutDescription>
        </LayoutHeader>
        <LayoutContent className="mt-4 w-full">
          <SettingsTabs
            orgSlug={orgSlug}
            tabs={[
              {
                id: "general",
                label: "General",
                href: `${orgPath}/settings`,
              },
              {
                id: "plan",
                label: "Plan and Billing",
                href: `${orgPath}/settings/billing`,
              },
              {
                id: "account",
                label: "Account",
                href: `${orgPath}/settings/account`,
              },
            ]}
          />
          <div className="mb-8 mt-6 w-full">{props.children}</div>
        </LayoutContent>
      </Layout>
    );
  } catch (error) {
    // Handle the error - maybe redirect to login
    redirect("/login");
  }
}
