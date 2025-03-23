"use client";

import { Button } from "@/components/core/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/data-display/card";
import { OrgDetailsForm } from "../(details)/OrgDetailsForm";
import type { OrganizationMembershipRole, User } from "@prisma/client";
import type { OrgDetailsFormSchemaType } from "../org.schema";
import { Plus } from "lucide-react";
import Link from "next/link";
import { PLAN_TYPES } from "@/features/billing/plans/fallback-prices";

type OrganizationWithPlan = {
  id: string;
  name: string;
  email: string | null;
  image: string | null;
  bannerImage: string | null;
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
  members: {
    roles: OrganizationMembershipRole[];
    user: User;
  }[];
};

type OrganizationContentProps = {
  organization: OrganizationWithPlan;
  orgSlug: string;
};

export function OrganizationContent({ organization }: OrganizationContentProps) {
  // Get the owner's profile image to use as default
  const ownerMember = organization.members.find(member => 
    member.roles.includes("OWNER")
  );
  
  // Always use owner's profile image if organization image is not set
  const defaultImage = organization.image ?? (ownerMember ? ownerMember.user?.image : null) ?? null;
  const defaultBannerImage = organization.bannerImage ?? null;

  // Check if user has PRO plan to create new organizations
  // Convert plan name to uppercase for case-insensitive comparison
  const planName = organization.plan.name.toUpperCase();
  const canCreateNewOrg = planName === PLAN_TYPES.PRO;

  // Transform organization data to match form schema
  const formDefaultValues: OrgDetailsFormSchemaType = {
    name: organization.name,
    email: organization.email ?? "",
    image: defaultImage,
    bannerImage: defaultBannerImage,
    bio: organization.bio ?? "",
    websiteUrl: organization.websiteUrl ?? "",
  };

  return (
    <div className="mx-auto max-w-4xl py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Organization Settings</h2>
          <p className="text-sm text-muted-foreground">
            Manage your organization's details and appearance
          </p>
        </div>
        {canCreateNewOrg ? (
          <Button asChild size="sm">
            <Link href="/orgs/new">
              <Plus className="mr-2 size-4" />
              New Organization
            </Link>
          </Button>
        ) : (
          <Button asChild size="sm" variant="outline">
            <Link href={`/orgs/${organization.slug}/settings/plan`}>
              <Plus className="mr-2 size-4" />
              Upgrade to PRO
            </Link>
          </Button>
        )}
      </div>

      <Card className="border shadow-sm">
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
