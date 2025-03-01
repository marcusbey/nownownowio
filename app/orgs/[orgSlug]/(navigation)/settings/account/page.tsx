import { combineWithParentMetadata } from "@/lib/metadata";
import { prisma } from "@/lib/prisma";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";
import { getOrgsMembers } from "@/query/org/get-orgs-members";
import type { PageParams } from "@/types/next";
import { OrganizationMembershipRole } from "@prisma/client";
import { Separator } from "@/components/layout/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/data-display/card";
import { User, Users, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/core/button";
import { PersonalAccountForm } from "./PersonalAccountForm";
import { MembersManagement } from "./MembersManagement";

export const generateMetadata = combineWithParentMetadata({
  title: "Account Settings",
  description: "Manage your account, organization members, and danger zone settings.",
});

export default async function AccountPage({ params }: PageParams<{ orgSlug: string }>) {
  const { orgSlug } = params;
  const { org, user } = await getRequiredCurrentOrgCache(orgSlug);

  const members = await getOrgsMembers(org.id);

  const invitations = await prisma.verificationToken.findMany({
    where: {
      identifier: {
        endsWith: `-invite-${org.id}`,
      },
      expires: {
        gt: new Date(),
      },
    },
    select: {
      data: true,
    },
  });

  const invitedEmail = invitations
    .map((i) => (i?.data as { email?: string })?.email)
    .filter(Boolean) as string[];

  const usersOrganizationsCount = await prisma.organizationMembership.count({
    where: {
      userId: user.id,
    },
  });

  return (
    <div className="container max-w-4xl py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Account Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your account information, organization members, and danger zone settings
        </p>
      </div>

      {/* Personal Account Section */}
      <section className="mb-12 p-6 bg-muted/10 rounded-lg border border-border/40">
        <div className="flex items-center gap-2 mb-6">
          <User className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-medium">Personal Account</h3>
        </div>
        
        {/* Using the client component for editable form */}
        <PersonalAccountForm user={user} />
      </section>

      {/* Organization Members Section */}
      <section className="mb-12 p-6 bg-muted/10 rounded-lg border border-border/40">
        <div className="flex items-center gap-2 mb-6">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-medium">Organization Members</h3>
        </div>
        
        <div>
          <div className="mb-4">
            <h4 className="text-lg font-medium">Members</h4>
            <p className="text-sm text-muted-foreground">
              Manage members of your organization
            </p>
          </div>
          
          <MembersManagement 
            members={members} 
            invitedEmail={invitedEmail} 
            maxMembers={org.plan.maximumMembers} 
            orgSlug={org.slug}
            currentUserRoles={members.find(m => m.userId === user.id)?.roles || []}
            currentUserId={user.id}
          />
        </div>
      </section>

      {/* Danger Zone Section */}
      <section className="mb-12 p-6 bg-destructive/5 rounded-lg border border-destructive/20">
        <div className="flex items-center gap-2 mb-6">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <h3 className="text-xl font-medium text-destructive">Danger Zone</h3>
        </div>
        
        <div className="mb-8">
          <h4 className="text-lg font-medium text-destructive mb-2">Organization Slug</h4>
          <p className="text-sm text-muted-foreground mb-2">
            Changing your organization's slug will break all existing links
          </p>
          <p className="text-sm text-muted-foreground">
            Your current organization slug is <code className="px-1 py-0.5 bg-muted rounded text-sm">{org.slug}</code>
          </p>
        </div>
        
        <Separator className="my-6 bg-destructive/20" />
        
        <div>
          <h4 className="text-lg font-medium text-destructive mb-2">Delete Organization</h4>
          <p className="text-sm text-muted-foreground mb-2">
            Permanently delete this organization and all its data
          </p>
          
          <p className="text-sm text-muted-foreground mb-6">
            {usersOrganizationsCount <= 1 ? 
              "You can't delete this organization because you are the only member. If you want to delete your organization, you need to delete your account." :
              "By deleting your organization, you will lose all your data and your subscription will be cancelled. No refund will be provided."}
          </p>
          
          <div className="flex justify-end">
            <Button 
              variant="destructive"
              asChild
              className="w-40"
            >
              <Link href={`/orgs/${org.slug}/settings/danger`}>
                Danger Zone
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
