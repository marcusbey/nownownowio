import type { OrganizationMembershipRole, Prisma } from "@prisma/client";
import { notFound } from "next/navigation";
import { auth } from "../auth/helper";
import { prisma } from "../prisma";

/**
 * Helper function to extract org slug from a URL string
 * This version doesn't use headers() which is server-component only
 */
export const extractOrgSlugFromUrl = (url: string): string | null => {
  if (!url) {
    return null;
  }

  // get the parameters after /orgs/ or /organizations/ and before a / or ? (if there are params)
  const match = url.match(/\/(?:orgs|organizations)\/([^/?]+)(?:[/?]|$)/);

  if (!match) {
    return null;
  }

  const organizationSlug = match[1];

  if (!organizationSlug) {
    return null;
  }

  return organizationSlug;
};

/**
 * Standard organization select query
 */
export const OrgSelectQuery = (userId: string) =>
  ({
    id: true,
    slug: true,
    name: true,
    plan: true,
    email: true,
    image: true,
    bannerImage: true,
    bio: true,
    websiteUrl: true,
    stripeCustomerId: true,
    planChangedAt: true,
    members: {
      where: {
        userId: userId,
      },
      select: {
        roles: true,
      },
    },
  }) satisfies Prisma.OrganizationSelect;

export type CurrentOrgPayload = Prisma.OrganizationGetPayload<{
  select: ReturnType<typeof OrgSelectQuery>;
}>;

/**
 * Get current organization by slug
 * @param orgSlug Organization slug
 * @param roles Optional roles to filter by
 */
export async function getCurrentOrgBySlug(orgSlug: string, roles?: OrganizationMembershipRole[]) {
  const session = await auth();
  // In Next.js 15, session structure changed
  const userId = session?.id;

  if (!userId || !orgSlug) {
    return null;
  }

  // If roles is provided, use it for the hasSome query
  // Otherwise, don't filter by roles
  const org = await prisma.organization.findFirst({
    where: {
      slug: orgSlug,
      members: {
        some: {
          userId: userId,
          // Only add the roles filter if roles array is provided
          ...(roles && roles.length > 0 ? {
            roles: {
              hasSome: roles
            }
          } : {})
        }
      }
    },
    select: {
      id: true,
      slug: true,
      name: true,
      plan: true,
      email: true,
      image: true,
      bannerImage: true,
      bio: true,
      websiteUrl: true,
      stripeCustomerId: true,
      planChangedAt: true,
      members: {
        where: {
          userId: userId
        },
        select: {
          roles: true
        }
      }
    }
  });

  if (!org) {
    return null;
  }

  return {
    ...org,
    roles: org.members[0]?.roles ?? []
  };
}

/**
 * Get current organization from URL string
 * @param url The URL to extract the organization slug from
 * @param roles Optional roles to filter by
 */
export const getCurrentOrgFromUrl = async (url: string, roles?: OrganizationMembershipRole[]) => {
  const orgSlug = extractOrgSlugFromUrl(url);
  if (!orgSlug) {
    return null;
  }

  return getCurrentOrgBySlug(orgSlug, roles);
};

/**
 * Get required current organization by slug or throw notFound
 */
export const getRequiredCurrentOrgBySlug = async (
  orgSlug: string,
  roles?: OrganizationMembershipRole[],
) => {
  const result = await getCurrentOrgBySlug(orgSlug, roles);

  if (!result) {
    notFound();
  }

  return result;
};

/**
 * Get required current organization from URL or throw notFound
 */
export const getRequiredCurrentOrgFromUrl = async (
  url: string,
  roles?: OrganizationMembershipRole[],
) => {
  const result = await getCurrentOrgFromUrl(url, roles);

  if (!result) {
    notFound();
  }

  return result;
};
