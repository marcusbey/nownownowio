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
          <h1 className="mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-3xl font-bold text-transparent">Welcome to your new workspace!</h1>
          <p className="mb-8 text-muted-foreground">Let's set up your organization and get you started with all the powerful tools at your fingertips. The sidebar preview shows what you'll have access to once you're all set up.</p>
          <NewOrganizationForm />
        </div>
      </NewOrgNavigation>
    </div>
  );
}
