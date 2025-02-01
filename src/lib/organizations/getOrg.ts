import { OrganizationMembershipRole } from "@prisma/client";
import { notFound } from "next/navigation";
import { auth } from "../auth/auth";
import { prisma } from "../prisma";
import { logger } from "../logger";

export const getOrg = async (orgSlug: string) => {
  try {
    const org = await prisma.organization.findUnique({
      where: { slug: orgSlug },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        plan: true,
      },
    });

    if (!org) {
      return null;
    }

    return org;
  } catch (error) {
    logger.error("Error fetching organization:", error);
    return null;
  }
};

export const getCurrentOrg = async (orgSlug: string, requiredRoles?: OrganizationMembershipRole[]) => {
  const session = await auth();

  if (!session?.user) {
    logger.info("No authenticated user found");
    return null;
  }

  try {
    const membership = await prisma.organizationMembership.findFirst({
      where: {
        userId: session.user.id,
        organization: {
          slug: orgSlug,
        },
      },
      include: {
        organization: {
          include: {
            members: {
              include: {
                user: true,
              },
            },
            plan: true,
          },
        },
      },
    });

    if (!membership) {
      logger.info("No membership found for user in organization", { userId: session.user.id, orgSlug });
      return null;
    }

    // Check if user has required roles
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRequiredRole = membership.roles.some(role => 
        role === "OWNER" || requiredRoles.includes(role)
      );
      
      if (!hasRequiredRole) {
        logger.info("User does not have required roles", { 
          userId: session.user.id, 
          orgSlug,
          userRoles: membership.roles,
          requiredRoles 
        });
        return null;
      }
    }

    return {
      org: membership.organization,
      user: session.user,
      roles: membership.roles,
    };
  } catch (error) {
    logger.error("Error fetching current organization:", error);
    return null;
  }
};

export const getRequiredCurrentOrg = async (
  orgSlug?: string,
  roles?: OrganizationMembershipRole[],
) => {
  const result = await getCurrentOrg(orgSlug, roles);

  if (!result) {
    notFound();
  }

  return result;
};