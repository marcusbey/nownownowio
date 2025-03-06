"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/data-display/card";
import { OrgDetailsForm } from "./(details)/OrgDetailsForm";
import type { Organization, OrganizationMembershipRole, User } from "@prisma/client";
import { OrgDetailsFormSchema, type OrgDetailsFormSchemaType } from "./org.schema";

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
    user: User;
  }>;
};

type SettingsContentProps = {
  organization: OrganizationWithPlan;
  orgSlug: string;
};

export function SettingsContent({ organization, orgSlug }: SettingsContentProps) {
  // Get the owner's profile image to use as default
  const ownerMember = organization.members.find(member => 
    member.roles.includes("OWNER")
  );
  
  // Always use owner's profile image if organization image is not set
  const defaultImage = organization.image || ownerMember?.user.image || null;

  // Transform organization data to match form schema
  const formDefaultValues: OrgDetailsFormSchemaType = {
    name: organization.name,
    email: organization.email || "",
    image: defaultImage,
    bio: organization.bio || "",
    websiteUrl: organization.websiteUrl || "",
  };

  return (
    <div className="py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">General Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your organization's general settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Organization Details</CardTitle>
          <CardDescription>
            Customize your organization's appearance and information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrgDetailsForm defaultValues={formDefaultValues} />
        </CardContent>
      </Card>
    </div>
  );
}
