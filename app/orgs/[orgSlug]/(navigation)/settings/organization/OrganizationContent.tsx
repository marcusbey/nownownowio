"use client";

import { Button } from "@/components/core/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/data-display/card";
import { PLAN_TYPES } from "@/features/billing/plans/fallback-prices";
import type { OrganizationMembershipRole, User } from "@prisma/client";
import { Plus } from "lucide-react";
import Link from "next/link";
import { OrgDetailsForm } from "../(details)/OrgDetailsForm";
import type { OrgDetailsFormSchemaType } from "../org.schema";

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
  plan?: {
    id: string;
    createdAt?: Date;
    name?: string;
    updatedAt?: Date;
    type: string;
    maximumMembers?: number;
  } | null;
  members: {
    roles: OrganizationMembershipRole[];
    user?: User;
  }[];
  planChangedAt?: Date | null;
};

type OrganizationContentProps = {
  organization: OrganizationWithPlan;
  orgSlug: string;
};

export function OrganizationContent({
  organization,
}: OrganizationContentProps) {
  // Get the owner's profile image to use as default
  const ownerMember = organization.members.find((member) =>
    member.roles.includes("OWNER"),
  );

  // Always use owner's profile image if organization image is not set
  // Safely access user image with proper null checks
  const ownerImage = ownerMember?.user ? ownerMember.user.image : null;
  const defaultImage = organization.image ?? ownerImage ?? null;
  const defaultBannerImage = organization.bannerImage ?? null;

  // Extract the plan details from the organization plan object
  // Note: The plan object structure is different from settings-plan-content.tsx
  const planId = organization.plan?.id ?? "";
  const planType = organization.plan?.type ?? "";

  // Log plan details for debugging
  console.log("📊 OrganizationContent - Plan details:", {
    planId,
    planType,
    rawPlan: organization.plan,
    hasPlanChangedAt: !!organization.planChangedAt,
    planChangedAtValue: organization.planChangedAt,
  });

  // Check if the current plan is a PRO plan using multiple methods
  // 1. Check if the plan ID contains 'PRO'
  // 2. Check if the plan type equals 'PRO'
  // 3. Check if plan type contains 'PRO' as a fallback
  const isPro =
    planId.toUpperCase().includes("PRO") ||
    planType.toUpperCase() === PLAN_TYPES.PRO ||
    planType.toUpperCase().includes("PRO") ||
    (organization.planChangedAt !== null &&
      organization.planChangedAt !== undefined); // If planChangedAt is set, this indicates a paid plan

  // For BASIC plans, also treat them as Pro for UI purposes
  // This allows creating new organization for any paid plan
  const isBasic =
    planType.toUpperCase() === PLAN_TYPES.BASIC ||
    planId.toUpperCase().includes("BASIC");

  // Allow creating new organizations for PRO or BASIC users
  const canCreateNewOrg = isPro || isBasic;

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
    rawImageType: organization.image ? typeof organization.image : "null",
    rawBannerImage: organization.bannerImage,
    rawBannerImageType: organization.bannerImage
      ? typeof organization.bannerImage
      : "null",
    defaultImage,
    defaultBannerImage,
    ownerImage,
    bio: organization.bio,
    websiteUrl: organization.websiteUrl,
    slug: organization.slug,
    organizationKeys: Object.keys(organization),
    planInfo: {
      id: organization.plan?.id,
      type: organization.plan?.type,
    },
  });

  console.log(
    "📊 OrganizationContent - Form default values:",
    formDefaultValues,
  );

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

      {/* Debug panel - only visible in development */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-8 rounded-md border border-yellow-500/30 bg-yellow-500/10 p-4 text-xs text-yellow-700">
          <h3 className="mb-2 font-semibold">Debug Information</h3>
          <div className="space-y-1">
            <div>Organization ID: {organization.id}</div>
            <div>Organization Name: {organization.name}</div>
            <div>Plan ID: {organization.plan?.id ?? "Not set"}</div>
            <div>Plan Type: {organization.plan?.type ?? "Not set"}</div>
            <div>Plan Name: {organization.plan?.name ?? "Not set"}</div>
            <div>
              Plan Changed At:{" "}
              {organization.planChangedAt
                ? new Date(organization.planChangedAt).toLocaleString()
                : "Not set"}
            </div>
            <div>Is Pro: {isPro ? "Yes" : "No"}</div>
            <div>Can Create New Org: {canCreateNewOrg ? "Yes" : "No"}</div>
            <div>
              <strong>Raw Plan Object:</strong>
              <pre className="mt-1 overflow-auto rounded bg-black/10 p-2">
                {JSON.stringify(organization.plan, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
