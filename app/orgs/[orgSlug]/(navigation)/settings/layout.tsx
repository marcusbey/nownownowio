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
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SettingsNavigation } from "./_components/SettingsNavigation";

// Update the generateMetadata function
export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: "Settings",
    description: "Manage your organization settings.",
  };
};

export default async function RouteLayout(props: LayoutParams) {
  // Fix the params type issue by asserting the type
  const params = await props.params;
  const orgSlug = params.orgSlug as string;

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
        <LayoutContent className="mt-4 flex items-start gap-2 max-lg:flex-col">
          <SettingsNavigation
            orgSlug={orgSlug}
            links={[
              {
                href: `${orgPath}/settings`,
                label: "General",
                roles: ["ADMIN"],
              },
              {
                href: `${orgPath}/settings/widget`,
                label: "Widget",
                roles: ["ADMIN"],
              },
              {
                href: `${orgPath}/settings/members`,
                label: "Members",
                roles: ["ADMIN"],
              },
              {
                href: `${orgPath}/settings/subscription`,
                label: "Subscription",
                roles: ["ADMIN"],
              },
              {
                href: `${orgPath}/settings/billing`,
                label: "Billing",
                roles: ["ADMIN"],
              },
              {
                href: `${orgPath}/settings/danger`,
                label: "Danger Zone",
                roles: ["OWNER"],
              },
            ]}
          />
          <div className="mb-8 w-full flex-1">{props.children}</div>
        </LayoutContent>
      </Layout>
    );
  } catch (error) {
    // Handle the error - maybe redirect to login
    redirect("/login");
  }
}
