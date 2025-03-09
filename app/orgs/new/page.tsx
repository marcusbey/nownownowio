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
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <NewOrgNavigation userOrgs={userOrganizations}>
        <div className="relative z-10 mx-auto w-full max-w-3xl py-8">
          <h1 className="mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-3xl font-medium text-transparent">Let the words flow !!</h1>
          <p className="mb-8 text-muted-foreground">Let's set up your project.</p>
          <NewOrganizationForm />
        </div>
      </NewOrgNavigation>
    </div>
  );
}
