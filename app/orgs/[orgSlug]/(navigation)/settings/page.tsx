"use server";

import { logger } from "@/lib/logger";
import { combineWithParentMetadata } from "@/lib/metadata";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";
import type { PageParams } from "@/types/next";
import { notFound } from "next/navigation";
import { PersonalAccountContent } from "./PersonalAccountContent";

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
    const { user } = await getRequiredCurrentOrgCache(orgSlug);

    if (!user) {
      throw new Error("User not found");
    }

    // Check if the user's email is verified
    // For OAuth provider sign-ups, emailVerified should be set to a Date
    // For email/password sign-ups without verification, it will be null
    // We need to properly check if it's a valid Date object or string
    const isEmailVerified =
      user.emailVerified instanceof Date ||
      (typeof user.emailVerified === "string" &&
        new Date(user.emailVerified).toString() !== "Invalid Date");

    // Create a user object with the required properties for PersonalAccountContent
    const userForComponent = {
      id: user.id,
      name: user.name,
      displayName: user.displayName,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      bannerImage: user.bannerImage,
      passwordHash: user.passwordHash,
    };

    return (
      <PersonalAccountContent
        user={userForComponent}
        orgSlug={orgSlug}
        isEmailVerified={isEmailVerified}
      />
    );
  } catch (error) {
    logger.error("Error accessing settings page:", error);
    notFound();
  }
}
