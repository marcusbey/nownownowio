import TrendsSidebar from "@/components/TrendsSidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserDropdown } from "@/features/auth/UserDropdown";
import { ContactFeedbackPopover } from "@/features/contact/feedback/ContactFeedbackPopover";
import { NavigationWrapper } from "@/features/navigation/NavigationWrapper";
import { NavigationSkeleton } from "@/components/skeletons/NavigationSkeleton";
import { auth } from "@/lib/auth/helper";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";
import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";
import { OrganizationCommand } from "./OrgCommand";
import { NavigationLinks } from "./OrgLinks";
import { OrgsSelect } from "./OrgsSelect";
import { UpgradeCard } from "./UpgradeCard";
import { getUsersOrgs } from "@/query/org/get-users-orgs.query";
import { OrganizationMembershipRole } from "@prisma/client";

// Server Component
export async function OrgNavigation({ children }: PropsWithChildren) {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/sign-in");
  }

  const { org, roles } = await getRequiredCurrentOrgCache();
  const userOrganizations = await getUsersOrgs();

  return (
    <ClientOrgNavigation 
      org={org}
      roles={roles}
      userOrganizations={userOrganizations}
      session={session}
    >
      {children}
    </ClientOrgNavigation>
  );
}

// Client Component
function ClientOrgNavigation({ 
  org, 
  roles, 
  userOrganizations, 
  session,
  children 
}: PropsWithChildren<{
  org: any;
  roles: OrganizationMembershipRole[];
  userOrganizations: any[];
  session: any;
}>) {
  return (
    <>
      <NavigationWrapper
        logoChildren={
          <OrgsSelect
            currentOrgSlug={org.slug}
            orgs={userOrganizations}
            asTrigger={true}
          >
            <Avatar className="size-8">
              <AvatarFallback>
                {org.name ? org.name.slice(0, 2).toUpperCase() : session.user.email?.slice(0, 2).toUpperCase() || "??"}
              </AvatarFallback>
              {org.image && (
                <AvatarImage src={org.image} alt={org.name || "Organization"} />
              )}
            </Avatar>
          </OrgsSelect>
        }
        navigationChildren={
          <NavigationLinks
            links="organization"
            variant="default"
            organizationSlug={org.slug}
            roles={roles}
          />
        }
        bottomNavigationCardChildren={
          <div className="hidden md:block">
            <UpgradeCard />
          </div>
        }
        bottomNavigationChildren={
          <div className="flex w-full flex-col items-start gap-2">
            <ContactFeedbackPopover>
              <Button size="sm" variant="outline" className="hidden md:flex">
                Feedback
              </Button>
            </ContactFeedbackPopover>
            <UserDropdown>
              <Button
                variant="ghost"
                className="size-10 rounded-full"
                size="sm"
              >
                <Avatar className="size-8">
                  <AvatarFallback>
                    {session.user.name ? session.user.name.slice(0, 2).toUpperCase() : session.user.email?.slice(0, 2).toUpperCase() || "??"}
                  </AvatarFallback>
                  {session.user.image && <AvatarImage src={session.user.image} alt={session.user.name || "User"} />}
                </Avatar>
              </Button>
            </UserDropdown>
            <div className="mt-auto w-full md:hidden">
              <UpgradeCard />
            </div>
          </div>
        }
        topBarChildren={<OrganizationCommand />}
        rightSideBar={<TrendsSidebar />}
      >
        {children}
      </NavigationWrapper>
    </>
  );
}
