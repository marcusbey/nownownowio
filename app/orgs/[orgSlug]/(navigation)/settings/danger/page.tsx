import { buttonVariants } from "@/components/core/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/data-display/card";
import { Badge } from "@/components/data-display/badge";
import { Typography } from "@/components/data-display/typography";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/data-display/tooltip";
import { combineWithParentMetadata } from "@/lib/metadata";
import { prisma } from "@/lib/prisma";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";
import type { PageParams } from "@/types/next";
import { OrganizationMembershipRole } from "@prisma/client";
import { AlertTriangle, Info, ShieldAlert, Trash2 } from "lucide-react";
import Link from "next/link";
import { OrganizationDangerForm } from "./OrgDangerForm";
import { OrganizationDeleteDialog } from "./OrganizationDeleteDialog";

export const generateMetadata = combineWithParentMetadata({
  title: "Danger Zone",
  description: "Manage critical organization settings and deletion options.",
});

export default async function RoutePage(props: PageParams) {
  // In Next.js 15, params is a Promise that needs to be properly awaited
  const { orgSlug } = await props.params;
  
  const { org, user } = await getRequiredCurrentOrgCache(orgSlug, [
    OrganizationMembershipRole.OWNER,
  ]);
  
  // Ensure user is not null before proceeding
  if (!user) {
    throw new Error("User not found");
  }

  const usersOrganizationsCount = await prisma.organizationMembership.count({
    where: {
      userId: user.id,
    },
  });

  return (
    <div className="mx-auto max-w-4xl py-6">
      <div className="mb-8 border-b pb-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="rounded-full bg-amber-500/15 p-2">
            <ShieldAlert className="size-6 text-amber-500" />
          </div>
          <Typography variant="h2" className="font-bold text-foreground">Advanced Settings</Typography>
          <Badge variant="outline" className="ml-2 border-amber-500/50 font-medium text-amber-500">Owner Only</Badge>
        </div>
        <Typography className="max-w-2xl text-foreground/80">
          Manage important organization settings that require careful consideration. 
          Changes made here may affect all members and organization data.
        </Typography>
      </div>
      
      <div className="space-y-8">
        {/* Organization Slug Section */}
        <Card className="border-2 border-amber-500/20 bg-background shadow-md transition-colors hover:border-amber-500/30">
          <CardHeader className="border-b border-amber-500/10 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-amber-500" />
                <CardTitle className="text-lg font-bold text-foreground">Organization Slug</CardTitle>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <Info className="size-4 text-muted-foreground" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">The slug is part of your organization's URL and is used in all links to your organization.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <CardDescription className="mt-1 font-medium text-muted-foreground">
              Changing your organization's slug will break all existing links
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="mb-4 rounded-md border border-border bg-muted p-3">

              <Typography variant="small" className="font-medium text-foreground/70">Current slug:</Typography>
              <div className="mt-1 flex items-center gap-2">
                <code className="rounded border border-border bg-background px-2 py-1 font-mono text-sm">{org.slug}</code>
                <Typography variant="small" className="text-foreground/70">in URL: nownownow.io/orgs/<span className="font-semibold text-foreground">{org.slug}</span>/...</Typography>
              </div>
            </div>
            <OrganizationDangerForm defaultValues={org} />
          </CardContent>
        </Card>
        
        {/* Delete Organization Section */}
        <Card className="border-2 border-amber-500/20 bg-background shadow-md transition-colors hover:border-amber-500/30">
          <CardHeader className="border-b border-amber-500/10 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trash2 className="size-5 text-amber-500" />
                <CardTitle className="text-lg font-bold text-foreground">Delete Organization</CardTitle>
              </div>
              <Badge variant="outline" className="border-amber-500/50 text-xs font-bold uppercase text-amber-500">Irreversible</Badge>
            </div>
            <CardDescription className="mt-1 font-medium text-muted-foreground">
              Permanently delete this organization and all its data
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="mb-6 rounded-md border border-amber-500/20 bg-amber-500/10 p-4">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-500" />
                <div>
                  <Typography variant="small" className="mb-1 font-bold text-foreground">
                    Warning: This action cannot be undone
                  </Typography>
                  <Typography variant="small" className="text-foreground/80">
                    {usersOrganizationsCount <= 1 ? 
                      "You can't delete this organization because you are the only member. If you want to delete your organization, you need to delete your account." :
                      "By deleting your organization, you will lose all your data including posts, comments, and media. Your subscription will be cancelled with no refund."}
                  </Typography>
                </div>
              </div>
            </div>
            
            {usersOrganizationsCount <= 1 ? (
              <div className="flex justify-end">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href="/account/danger"
                        className={buttonVariants({
                          variant: "destructive",
                          size: "sm",
                          className: "gap-2"
                        })}
                      >
                        <Trash2 className="size-4" />
                        Delete Account
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This will delete your account and all associated data</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
