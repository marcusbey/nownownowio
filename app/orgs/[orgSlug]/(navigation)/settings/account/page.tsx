"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/data-display/card";
import { Button } from "@/components/core/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/data-display/tabs";
import { User, Users, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";
import type { Organization, OrganizationMembershipRole, User as UserType } from "@prisma/client";

type OrganizationWithPlan = {
  id: string;
  name: string;
  email: string | null;
  image: string | null;
  bio: string | null;
  websiteUrl: string | null;
  slug: string;
  stripeCustomerId: string | null;
  plan: {
    id: string;
    createdAt: Date;
    name: string;
    updatedAt: Date;
    maximumMembers: number;
  };
  members: Array<{
    roles: OrganizationMembershipRole[];
    user: UserType;
  }>;
};

export default function AccountPage() {
  const params = useParams();
  const orgSlug = params.orgSlug as string;
  
  return (
    <div className="container max-w-4xl py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Account Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your account information, organization members, and danger zone settings
        </p>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Personal Account
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Organization Members
          </TabsTrigger>
          <TabsTrigger value="danger" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Danger Zone
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Information</CardTitle>
              <CardDescription>
                Update your account details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage your personal account settings, including name, email, and profile information.
              </p>
              <div className="mt-4">
                <Link 
                  href="/account" 
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                >
                  Go to Account Settings
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="members" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Organization Members</CardTitle>
              <CardDescription>
                Manage members of your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Add, remove, or update roles for members of your organization.
              </p>
              <div className="mt-4">
                <Link 
                  href={`/orgs/${orgSlug}/settings/members`} 
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                >
                  Manage Members
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="danger" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Delete your organization or perform dangerous actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Warning: Actions in this section can result in permanent data loss and cannot be undone.
              </p>
              <div className="mt-4">
                <Link 
                  href={`/orgs/${orgSlug}/settings/danger`} 
                  className="inline-flex h-10 items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground ring-offset-background transition-colors hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                >
                  Go to Danger Zone
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
