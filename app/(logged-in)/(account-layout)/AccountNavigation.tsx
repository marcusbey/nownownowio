import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserDropdown } from "@/features/auth/UserDropdown";
import { auth } from "@/lib/auth/helper";
import { prisma } from "@/lib/prisma";
import { getUsersOrgs } from "@/query/org/get-users-orgs.query";
import { PropsWithChildren } from "react";
import { NavigationWrapper } from "../../../src/features/navigation/NavigationWrapper";
import { NavigationLinks } from "../../orgs/[orgSlug]/(navigation)/_navigation/OrgLinks";
import { OrgsSelect } from "../../orgs/[orgSlug]/(navigation)/_navigation/OrgsSelect";
import { redirect } from "next/navigation";
import Link from "next/link";

export async function AccountNavigation({ children }: PropsWithChildren) {
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

  const userOrgs = await getUsersOrgs();

  return (
    <NavigationWrapper
      logoChildren={
        <OrgsSelect orgs={userOrgs}>
          <Avatar className="size-8">
            <AvatarFallback>
              {user.email ? user.email.slice(0, 2) : "??"}
            </AvatarFallback>
            {user.image && <AvatarImage src={user.image} />}
          </Avatar>
          <span>{user.name}</span>
        </OrgsSelect>
      }
      navigationChildren={<NavigationLinks links="account" variant="default" />}
      bottomNavigationChildren={
        <UserDropdown>
          <Link href="/account">
            <Button variant="ghost" className="size-10 rounded-full" size="sm">
              <Avatar className="size-8">
                <AvatarFallback>
                  {user.email ? user.email.slice(0, 2) : "??"}
                </AvatarFallback>
                {user.image && <AvatarImage src={user.image} />}
              </Avatar>
            </Button>
          </Link>
        </UserDropdown>
      }
    >
      {children}
    </NavigationWrapper>
  );
}
