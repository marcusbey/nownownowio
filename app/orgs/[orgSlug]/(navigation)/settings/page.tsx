"use server";

import { auth } from "@/lib/auth/helper";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";
import type { PageParams } from "@/types/next";
import { notFound } from "next/navigation";
import { PersonalAccountContent } from "./PersonalAccountContent";
import { combineWithParentMetadata } from "@/lib/metadata";

export const generateMetadata = combineWithParentMetadata({
  title: "Personal Account Settings",
  description: "Manage your personal account settings and preferences.",
});

type SettingsPageParams = PageParams<{
  orgSlug: string;
}>;

export default async function RoutePage(props: SettingsPageParams) {
  // In Next.js 15, params is a Promise that needs to be properly awaited
  const params = await props.params;
  const orgSlug = params.orgSlug;

  try {
    // Get the current user and organization
    const { org, user } = await getRequiredCurrentOrgCache(orgSlug);
    
    // Check if the user's email is verified
    const isEmailVerified = user.emailVerified !== null;

    return <PersonalAccountContent user={user} orgSlug={orgSlug} isEmailVerified={isEmailVerified} />;
  } catch (error) {
    logger.error("Error accessing settings page:", error);
    notFound();
  }
}
