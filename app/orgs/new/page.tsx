import { createSearchParamsMessageUrl } from "@/features/ui/searchparams-message/create-search-params-message-url";
import { requiredAuth } from "@/lib/auth/helper";
import { SiteConfig } from "@/site-config";
import { getUsersOrgs } from "@/query/org/get-users-orgs.query";
import { redirect } from "next/navigation";
import { NewOrgNavigation } from "./_components/new-org-navigation";
import { NewOrganizationForm } from "./_components/new-org-form";
import { AnimatedPattern } from "./_components/animated-pattern";

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-7xl mx-auto py-8 px-4">
          <div className="flex flex-col justify-center">
            <h1 className="mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-3xl font-medium text-transparent">Let the words flow !!</h1>
            <p className="mb-8 text-muted-foreground">Let's set up your organization.</p>
            <NewOrganizationForm />
          </div>
          <div className="hidden md:block">
            <AnimatedPattern className="size-full min-h-[600px]" />
          </div>
        </div>
      </NewOrgNavigation>
    </div>
  );
}
