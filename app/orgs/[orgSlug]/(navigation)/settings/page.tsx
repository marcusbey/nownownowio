"use server";

import { auth } from "@/lib/auth/helper";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";
import type { PageParams } from "@/types/next";
import { notFound } from "next/navigation";
import { SettingsContent } from "./SettingsContent";

type SettingsPageParams = PageParams<{
  orgSlug: string;
}>;

async function getCurrentOrg(slug: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  try {
    // Get organization by slug and check if user has access
    const organization = await prisma.organization.findUnique({
      where: { slug },
      include: {
        memberships: {
          where: {
            userId: session.user.id,
          },
          select: {
            role: true,
          },
        },
      },
    });

    if (!organization || organization.memberships.length === 0) {
      return null;
    }

    return {
      ...organization,
      userRole: organization.memberships[0].role,
    };
  } catch (error) {
    console.error("Error getting organization:", error);
    return null;
  }
}

export default async function RoutePage(props: SettingsPageParams) {
  // Get the params safely
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

    return <SettingsContent organization={organization} orgSlug={orgSlug} />;
  } catch (error) {
    logger.error("Error accessing settings page:", error);
    notFound();
  }
}
