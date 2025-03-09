import { createSearchParamsMessageUrl } from "@/features/ui/searchparams-message/create-search-params-message-url";
import { requiredAuth } from "@/lib/auth/helper";
import { SiteConfig } from "@/site-config";
import { getUsersOrgs } from "@/query/org/get-users-orgs.query";
import { redirect } from "next/navigation";
import { NewOrgNavigation } from "./_components/new-org-navigation";
import { NewOrganizationForm } from "./_components/new-org-form";

export default async function RoutePage() {
  await requiredAuth();

  if (SiteConfig.features.enableSingleMemberOrg) {
    redirect(
      createSearchParamsMessageUrl(`/orgs`, {
        type: "message",
        message: "You can't create an organization.",
      }),
    );
  }

  const userOrganizations = await getUsersOrgs();

  return (
    <div className="flex min-h-screen flex-col">
      <NewOrgNavigation userOrgs={userOrganizations}>
        <div className="mx-auto w-full max-w-4xl py-8">
          <h1 className="mb-8 text-3xl font-bold">Create a new organization</h1>
          <p className="mb-8 text-muted-foreground">Fill in the details below to create your new organization. The sidebar on the left shows a preview of the navigation you'll have access to after creating your organization.</p>
          <NewOrganizationForm />
        </div>
      </NewOrgNavigation>
    </div>
  );
}
