import { combineWithParentMetadata } from "@/lib/metadata";
import { prisma } from "@/lib/prisma";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";
import { getOrgsMembers } from "@/query/org/get-orgs-members";
import type { PageParams } from "@/types/next";
import { OrganizationMembershipRole } from "@prisma/client";
import { Separator } from "@/components/layout/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/data-display/card";
import { User, Users, AlertTriangle, Mail, Save } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/data-display/avatar";
import { Progress } from "@/components/feedback/progress";
import { Badge } from "@/components/data-display/badge";
import { Button } from "@/components/core/button";
import { PersonalAccountForm } from "./PersonalAccountForm";

export const generateMetadata = combineWithParentMetadata({
  title: "Account Settings",
  description: "Manage your account, organization members, and danger zone settings.",
});

export default async function AccountPage(props: PageParams) {
  const { org, user } = await getRequiredCurrentOrgCache();

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
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-medium">Personal Account</h3>
        </div>
        
        {/* Using the client component for editable form */}
        <PersonalAccountForm user={user} />
      </div>

      {/* Organization Members Section */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-medium">Organization Members</h3>
        </div>
        
        <Card className="bg-background border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Members</CardTitle>
                <CardDescription>
                  Manage members of your organization
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{members.length}/{org.plan.maximumMembers}</span>
                <Progress 
                  value={(members.length / org.plan.maximumMembers) * 100} 
                  className="w-20 h-2 bg-primary/20" 
                />
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {/* Member List Preview - Show first 3 members */}
              <div className="space-y-3">
                {members.slice(0, 3).map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 rounded-md bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        {member.user.image ? (
                          <AvatarImage src={member.user.image} alt={member.user.name || "Member"} />
                        ) : (
                          <AvatarFallback>
                            {(member.user.name || member.user.email || "").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.user.name}</p>
                        <p className="text-xs text-muted-foreground">{member.user.email}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs uppercase">
                      {member.roles[0]}
                    </Badge>
                  </div>
                ))}
                
                {members.length > 3 && (
                  <div className="text-sm text-muted-foreground text-center py-2">
                    + {members.length - 3} more members
                  </div>
                )}
              </div>
              
              {/* Invited Members */}
              {invitedEmail.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Pending Invitations</h4>
                  <div className="space-y-2">
                    {invitedEmail.map((email, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{email}</span>
                        <Badge variant="secondary" className="ml-auto text-xs">Pending</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end mt-4">
                <Button 
                  asChild
                  className="bg-primary hover:bg-primary/90"
                >
                  <Link href={`/orgs/${org.slug}/settings/members`}>
                    Manage All Members
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <h3 className="text-xl font-medium text-destructive">Danger Zone</h3>
        </div>
        
        <Card className="border-destructive/20 bg-background">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-destructive">Organization Slug</CardTitle>
            <CardDescription>
              Changing your organization's slug will break all existing links
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your current organization slug is <code className="px-1 py-0.5 bg-muted rounded text-sm">{org.slug}</code>
            </p>
          </CardContent>
        </Card>
        
        <div className="my-4">
          <Separator />
        </div>
        
        <Card className="border-destructive/20 bg-background">
          <CardHeader className="pb-4">
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
            
            <div className="flex justify-end">
              <Button 
                variant="destructive"
                asChild
              >
                <Link href={`/orgs/${org.slug}/settings/danger`}>
                  Go to Danger Zone
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
