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
    <div className="py-6 max-w-4xl mx-auto">
      <div className="mb-8 border-b pb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-amber-500/15 p-2 rounded-full">
            <ShieldAlert className="size-6 text-amber-500" />
          </div>
          <Typography variant="h2" className="text-foreground font-bold">Advanced Settings</Typography>
          <Badge variant="outline" className="ml-2 font-medium border-amber-500/50 text-amber-500">Owner Only</Badge>
        </div>
        <Typography className="max-w-2xl text-foreground/80">
          Manage important organization settings that require careful consideration. 
          Changes made here may affect all members and organization data.
        </Typography>
      </div>
      
      <div className="space-y-8">
        {/* Organization Slug Section */}
        <Card className="border-2 border-amber-500/20 shadow-md hover:border-amber-500/30 transition-colors bg-background">
          <CardHeader className="pb-2 border-b border-amber-500/10">
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
            <CardDescription className="mt-1 text-muted-foreground font-medium">
              Changing your organization's slug will break all existing links
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="bg-muted p-3 rounded-md mb-4 border border-border">

              <Typography variant="small" className="text-foreground/70 font-medium">Current slug:</Typography>
              <div className="flex items-center gap-2 mt-1">
                <code className="px-2 py-1 bg-background rounded text-sm font-mono border border-border">{org.slug}</code>
                <Typography variant="small" className="text-foreground/70">in URL: nownownow.io/orgs/<span className="font-semibold text-foreground">{org.slug}</span>/...</Typography>
              </div>
            </div>
            <OrganizationDangerForm defaultValues={org} />
          </CardContent>
        </Card>
        
        {/* Delete Organization Section */}
        <Card className="border-2 border-amber-500/20 shadow-md hover:border-amber-500/30 transition-colors bg-background">
          <CardHeader className="pb-2 border-b border-amber-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trash2 className="size-5 text-amber-500" />
                <CardTitle className="text-lg font-bold text-foreground">Delete Organization</CardTitle>
              </div>
              <Badge variant="outline" className="uppercase text-xs font-bold border-amber-500/50 text-amber-500">Irreversible</Badge>
            </div>
            <CardDescription className="mt-1 text-muted-foreground font-medium">
              Permanently delete this organization and all its data
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-md p-4 mb-6">
              <div className="flex gap-3">
                <AlertTriangle className="size-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <Typography variant="small" className="font-bold text-foreground mb-1">
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
