import { Button, buttonVariants } from "@/components/core/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/data-display/card";
import { Separator } from "@/components/layout/separator";
import { combineWithParentMetadata } from "@/lib/metadata";
import { prisma } from "@/lib/prisma";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";
import type { PageParams } from "@/types/next";
import { OrganizationMembershipRole } from "@prisma/client";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { OrganizationDangerForm } from "./OrgDangerForm";
import { OrganizationDeleteDialog } from "./OrganizationDeleteDialog";

export const generateMetadata = combineWithParentMetadata({
  title: "Danger Zone",
  description: "Manage critical organization settings and deletion options.",
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
    <div className="py-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Danger Zone
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage critical organization settings that could have serious consequences
        </p>
      </div>
      
      <div className="space-y-8">
        {/* Organization Slug Section */}
        <Card className="border border-destructive/20 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-destructive">Organization Slug</CardTitle>
            <CardDescription>
              Changing your organization's slug will break all existing links
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Your current organization slug is <code className="px-1 py-0.5 bg-muted rounded text-sm">{org.slug}</code>
            </p>
            <OrganizationDangerForm defaultValues={org} />
          </CardContent>
        </Card>
        
        {/* Delete Organization Section */}
        <Card className="border border-destructive/20 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-destructive">Delete Organization</CardTitle>
            <CardDescription>
              Permanently delete this organization and all its data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {usersOrganizationsCount <= 1 ? 
                "You can't delete this organization because you are the only member. If you want to delete your organization, you need to delete your account." :
                "By deleting your organization, you will lose all your data and your subscription will be cancelled. No refund will be provided."}
            </p>
            
            {usersOrganizationsCount <= 1 ? (
              <div className="flex justify-end">
                <Link
                  href="/account/danger"
                  className={buttonVariants({
                    variant: "destructive",
                  })}
                >
                  Delete Account
                </Link>
              </div>
            ) : (
              <div className="flex justify-end">
                <OrganizationDeleteDialog org={org} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
