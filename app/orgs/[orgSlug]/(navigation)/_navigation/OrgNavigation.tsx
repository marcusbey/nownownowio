import TrendsSidebar from "@/components/TrendsSidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserDropdown } from "@/features/auth/UserDropdown";
import { ContactFeedbackPopover } from "@/features/contact/feedback/ContactFeedbackPopover";
import { NavigationWrapper } from "@/features/navigation/NavigationWrapper";
import { auth } from "@/lib/auth/helper";
import { prisma } from "@/lib/prisma";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";
import { getUsersOrgs } from "@/query/org/get-users-orgs.query";
import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";
import { OrganizationCommand } from "./OrgCommand";
import { NavigationLinks } from "./OrgLinks";
import { OrgsSelect } from "./OrgsSelect";
import { UpgradeCard } from "./UpgradeCard";

export async function OrgNavigation({ children }: PropsWithChildren) {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
    redirect("/sign-in");
  }

  const { org, roles } = await getRequiredCurrentOrgCache();

  const userOrganizations = await getUsersOrgs();

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
        logoChildren={
          <OrgsSelect
            currentOrgSlug={org.slug}
            orgs={userOrganizations}
            asTrigger={true}
          >
            <Avatar className="size-8">
              <AvatarFallback>
                {user.email ? user.email.slice(0, 2) : "??"}
              </AvatarFallback>
              {user.image && <AvatarImage src={user.image} />}
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
                    {user.email ? user.email.slice(0, 2) : "??"}
                  </AvatarFallback>
                  {user.image && <AvatarImage src={user.image} />}
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
