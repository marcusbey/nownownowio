"use server";

import { auth } from "@/lib/auth/helper";
import { logger } from "@/lib/logger";
import { combineWithParentMetadata } from "@/lib/metadata";
import { prisma } from "@/lib/prisma";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";
import type { PageParams } from "@/types/next";
import { notFound } from "next/navigation";
import { OrganizationContent } from "./OrganizationContent";

export const generateMetadata = combineWithParentMetadata({
  title: "Organization Settings",
  description: "Manage your organization's details and appearance.",
});

type OrganizationPageParams = PageParams<{
  orgSlug: string;
}>;

async function getCurrentOrg(slug: string) {
  const session = await auth();

  if (!session?.id) {
    return null;
  }

  try {
    // Get organization by slug and check if user has access
    const organization = await prisma.organization.findUnique({
      where: { slug },
      include: {
        members: {
          where: {
            userId: session.id,
          },
          select: {
            roles: true,
          },
        },
      },
    });

    if (!organization || organization.members.length === 0) {
      return null;
    }

    return {
      ...organization,
      userRole: organization.members[0].roles,
    };
  } catch (error) {
    console.error("Error getting organization:", error);
    return null;
  }
}

export default async function OrganizationPage(props: OrganizationPageParams) {
  // In Next.js 15, params is a Promise that needs to be properly awaited
  const params = await props.params;
  const orgSlug = params.orgSlug;

  // Use getCurrentOrg without passing roles (it should use orgSlug only)
  const orgResult = await getCurrentOrg(orgSlug);

  if (orgResult) {
    logger.info("User has access to organization:", {
      organization: orgResult.name,
      userRole: orgResult.userRole,
    });
  }

  try {
    // getRequiredCurrentOrgCache expects just the orgSlug as the first param
    const { org: organization } = await getRequiredCurrentOrgCache(orgSlug);

    // Debug plan information
    logger.info("Organization plan info:", {
      orgId: organization.id,
      orgSlug: organization.slug,
      planId: organization.plan?.id,
      planType: organization.plan?.type,
      hasPlanChangedAt: !!organization.planChangedAt,
      planChangedAtValue: organization.planChangedAt,
    });

    // Ensure the organization object includes any necessary fields
    return (
      <OrganizationContent
        organization={{
          ...organization,
          planChangedAt: organization.planChangedAt,
        }}
        orgSlug={orgSlug}
      />
    );
  } catch (error) {
    logger.error("Error accessing organization settings page:", error);
    notFound();
  }
}
