import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth/helper";
import { getUsersOrgs } from "@/query/org/get-users-orgs.query";
import { PropsWithChildren } from "react";
import { OrgsSelect } from "../../../app/orgs/[orgSlug]/(navigation)/_navigation/OrgsSelect";
import { UserDropdown } from "../auth/UserDropdown";
import { NavigationWrapper } from "./NavigationWrapper";

export default async function AuthNavigationWrapper(props: PropsWithChildren) {
  const user = await auth();

  if (!user) {
    return <NavigationWrapper>{props.children}</NavigationWrapper>;
  }

  const userOrgs = await getUsersOrgs();

  return (
    <NavigationWrapper
      logoChildren={
        <OrgsSelect orgs={userOrgs} currentOrgSlug="new">
          <span>Organization...</span>
        </OrgsSelect>
      }
      bottomNavigationChildren={
        <UserDropdown>
          <Button variant="ghost" className="size-10 rounded-full" size="sm">
            <Avatar className="size-8">
              <AvatarFallback>
                {user?.user?.email ? user.user.email.slice(0, 2).toUpperCase() : "??"}
              </AvatarFallback>
              {user?.user?.image && <AvatarImage src={user.user.image} alt={user.user.email || 'User avatar'} />}
            </Avatar>
          </Button>
        </UserDropdown>
      }
    >
      {props.children}
    </NavigationWrapper>
  );
}
