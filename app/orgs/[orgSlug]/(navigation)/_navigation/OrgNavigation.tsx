import TrendsSidebar from "@/components/TrendsSidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserDropdown } from "@/features/auth/UserDropdown";
import { ContactFeedbackPopover } from "@/features/contact/feedback/ContactFeedbackPopover";
import { NavigationWrapper } from "@/features/navigation/NavigationWrapper";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";
// import { Menu } from "lucide-react";
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getUsersOrgs } from "@/query/org/get-users-orgs.query";
import { headers } from "next/headers";
import { PropsWithChildren } from "react";
import { OrganizationCommand } from "./OrgCommand";
import { NavigationLinks } from "./OrgLinks";
import { OrgsSelect } from "./OrgsSelect";
import { UpgradeCard } from "./UpgradeCard";

export async function OrgNavigation({ children }: PropsWithChildren) {
  const { org, user, roles } = await getRequiredCurrentOrgCache();

  const userOrganizations = await getUsersOrgs();

  // Retrieve the injected 'x-url' header from the middleware
  const requestHeaders = headers();
  const xUrl = requestHeaders.get("x-url");

  let hideSidebar = false;

  if (xUrl) {
    const url = new URL(xUrl);
    const pathname = url.pathname;

    // Define your conditions based on the pathname
    // For example, show the sidebar on specific routes
    const routesWithoutSidebar = [
      `/orgs/${org.slug}/users`,
      `/orgs/${org.slug}/activities`,
      `/orgs/${org.slug}/settings`,
      // Add other routes where you want the sidebar
    ];

    hideSidebar = routesWithoutSidebar.some((route) =>
      pathname.startsWith(route),
    );
  }
  return (
    <>
      {/* <div className="sm:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed left-4 top-4 z-50"
            >
              <Menu className="size-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] sm:w-[350px]">
            <NavigationLinks
              links="organization"
              variant="mobile"
              organizationSlug={org.slug}
              roles={roles}
            />
          </SheetContent>
        </Sheet>
      </div> */}
      <NavigationWrapper
        hideSidebar={hideSidebar}
        logoChildren={
          <OrgsSelect
            currentOrgSlug={org.slug}
            orgs={userOrganizations}
            asTrigger={true}
          />
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
        buttomNavigationChildren={
          <>
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
                    {user.email ? user.email.slice(0, 2) : "??"}
                  </AvatarFallback>
                  {user.image && <AvatarImage src={user.image} />}
                </Avatar>
              </Button>
            </UserDropdown>
            <div className="md:hidden">
              <UpgradeCard />
            </div>
          </>
        }
        topBarChildren={<OrganizationCommand />}
        rightSideBar={!hideSidebar ? <TrendsSidebar /> : null}
      >
        {children}
      </NavigationWrapper>
    </>
  );
}
