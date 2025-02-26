import { Button } from "@/components/core/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/data-display/avatar";
import { UserDropdown } from "@/features/core/auth/user-dropdown";
import { auth } from "@/lib/auth/helper";
import { getUsersOrgs } from "@/query/org/get-users-orgs.query";
import type { PropsWithChildren } from "react";
import { OrgsSelect } from "../../../app/orgs/[orgSlug]/(navigation)/_navigation/orgs-select";
import { NavigationWrapper } from "../navigation/navigation-wrapper";

async function getAuthData() {
  const user = await auth();
  if (!user) return { user: null, userOrgs: [] };
  const userOrgs = await getUsersOrgs();
  return { user, userOrgs };
}

export default async function AuthNavigationWrapper(props: PropsWithChildren) {
  const { user, userOrgs } = await getAuthData();

  if (!user) {
    return <NavigationWrapper>{props.children}</NavigationWrapper>;
  }

  return (
    <NavigationWrapper
      logoChildren={
        <OrgsSelect orgs={userOrgs} currentOrgSlug="new">
          <span>Organization...</span>
        </OrgsSelect>
      }
      topBarCornerLeftChildren={
        <UserDropdown>
          <Button variant="ghost" className="size-10 rounded-full" size="sm">
            <Avatar className="size-8">
              <AvatarFallback>
                {user.email ? user.email.slice(0, 2) : "??"}
              </AvatarFallback>
              {user.image && <AvatarImage src={user.image} />}
            </Avatar>
          </Button>
        </UserDropdown>
      }
    >
      {props.children}
    </NavigationWrapper>
  );
}
