import { buttonVariants } from "@/components/core/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/data-display/card";
import { combineWithParentMetadata } from "@/lib/metadata";
import { prisma } from "@/lib/prisma";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";
import type { PageParams } from "@/types/next";
import { OrganizationMembershipRole } from "@prisma/client";
import Link from "next/link";
import { OrganizationDangerForm } from "./OrgDangerForm";
import { OrganizationDeleteDialog } from "./OrganizationDeleteDialog";

export const generateMetadata = combineWithParentMetadata({
  title: "Danger",
  description: "Delete your organization.",
});

export default async function RoutePage(props: PageParams) {
  // In Next.js 15, params is a Promise that needs to be properly awaited
  const params = await props.params;
  const orgSlug = params.orgSlug;
  
  const { org, user } = await getRequiredCurrentOrgCache(orgSlug, [
    OrganizationMembershipRole.OWNER,
  ]);

  const usersOrganizationsCount = await prisma.organizationMembership.count({
    where: {
      userId: user.id,
    },
  });

  return (
    <div className="flex flex-col gap-4 lg:gap-8">
      <OrganizationDangerForm defaultValues={org} />
      {usersOrganizationsCount <= 1 ? (
        <Card>
          <CardHeader>
            <CardTitle>Delete the organization</CardTitle>
            <CardDescription>
              You can't delete this organization because you are the only
              member. If you want delete your organization, you need to delete
              your account.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-end gap-2">
            <Link
              href="/account/danger"
              className={buttonVariants({
                variant: "outline",
              })}
            >
              Delete account
            </Link>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Delete the organization</CardTitle>
            <CardDescription>
              By deleting your organization, you will lose all your data and
              your subscription will be cancelled.
            </CardDescription>
            <CardDescription>No refund will be provided.</CardDescription>
          </CardHeader>
          <CardFooter>
            <OrganizationDeleteDialog org={org} />
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
