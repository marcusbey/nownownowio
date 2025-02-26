import type { OrganizationMembershipRole, Prisma } from "@prisma/client";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "../auth/helper";
import { prisma } from "../prisma";

/**
 * Helper function to get org slug from URL
 */
export const getOrgSlugFromUrl = async () => {
  const headerList = await headers();
  const xURL = headerList.get("x-url");

  if (!xURL) {
    return null;
  }

  // get the parameters after /orgs/ or /organizations/ and before a / or ? (if there are params)
  const match = xURL.match(/\/(?:orgs|organizations)\/([^/?]+)(?:[/?]|$)/);

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
    stripeCustomerId: true,
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
    const userId = session?.user?.id;

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
            stripeCustomerId: true,
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
        roles: org.members[0]?.roles || []
    };
}

/**
 * Get current organization from URL
 */
export const getCurrentOrg = async (roles?: OrganizationMembershipRole[]) => {
  const user = await auth();

  if (!user) {
    return null;
  }

  const organizationSlug = await getOrgSlugFromUrl();

  if (!organizationSlug) {
    return null;
  }

  const org = await prisma.organization.findFirst({
    where: {
      slug: organizationSlug,
      members: {
        some: {
          userId: user.id,
          ...(roles && roles.length > 0 ? {
            roles: {
              hasSome: roles
            }
          } : {})
        },
      },
    },
    select: OrgSelectQuery(user.id),
  });

  if (!org) {
    return null;
  }

  return {
    org,
    user,
    roles: org.members[0].roles,
  };
};

/**
 * Get required current organization or throw notFound
 */
export const getRequiredCurrentOrg = async (
  roles?: OrganizationMembershipRole[],
) => {
  const result = await getCurrentOrg(roles);

  if (!result) {
    notFound();
  }

  return result;
};
