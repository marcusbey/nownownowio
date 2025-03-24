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
    type: string;
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
  // Safely access user image with proper null checks
  const ownerImage = ownerMember && ownerMember.user ? ownerMember.user.image : null;
  const defaultImage = organization.image ?? ownerImage ?? null;
  const defaultBannerImage = organization.bannerImage ?? null;

  // Extract the plan details from the organization plan object
  // Note: The plan object structure is different from settings-plan-content.tsx
  const planId = organization.plan.id;
  const planType = organization.plan.type;
  
  // Check if the current plan is a PRO plan using multiple methods
  // 1. Check if the plan ID contains 'PRO'
  // 2. Check if the plan type equals 'PRO'
  const isPro = 
    planId.toUpperCase().includes('PRO') || 
    planType.toUpperCase() === PLAN_TYPES.PRO;
  
  // Allow creating new organizations for PRO users
  const canCreateNewOrg = isPro;

  // Transform organization data to match form schema
  const formDefaultValues: OrgDetailsFormSchemaType = {
    name: organization.name,
    email: organization.email ?? "",
    image: defaultImage,
    bannerImage: defaultBannerImage,
    bio: organization.bio ?? "",
    websiteUrl: organization.websiteUrl ?? "",
  };
  
  // Log the raw organization data and the form values for debugging
  console.log("📊 OrganizationContent - Raw organization data:", {
    id: organization.id,
    name: organization.name,
    email: organization.email,
    rawImage: organization.image,
    rawImageType: organization.image ? typeof organization.image : 'null',
    rawBannerImage: organization.bannerImage,
    rawBannerImageType: organization.bannerImage ? typeof organization.bannerImage : 'null',
    defaultImage,
    defaultBannerImage,
    ownerImage,
    bio: organization.bio,
    websiteUrl: organization.websiteUrl,
    slug: organization.slug,
    organizationKeys: Object.keys(organization),
    planInfo: {
      id: organization.plan.id,
      type: organization.plan.type
    }
  });
  
  console.log("📊 OrganizationContent - Form default values:", formDefaultValues);

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
