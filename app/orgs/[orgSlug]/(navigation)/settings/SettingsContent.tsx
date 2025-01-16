"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OrgDetailsForm } from "./(details)/OrgDetailsForm";
import type { Organization, OrganizationMembershipRole } from "@prisma/client";
import { OrgDetailsFormSchema, type OrgDetailsFormSchemaType } from "./org.schema";

type OrganizationWithPlan = {
  id: string;
  name: string;
  email: string | null;
  image: string | null;
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
  }>;
};

type SettingsContentProps = {
  organization: OrganizationWithPlan;
  orgSlug: string;
};

export function SettingsContent({ organization, orgSlug }: SettingsContentProps) {
  // Transform organization data to match form schema
  const formDefaultValues: OrgDetailsFormSchemaType = {
    name: organization.name,
    email: organization.email || "",
    image: organization.image,
    bio: "",
    websiteUrl: "",
  };

  return (
    <div className="container max-w-4xl py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Organization Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your organization's settings and integrations
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
