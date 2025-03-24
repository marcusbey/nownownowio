import { OrganizationMembershipRole, type User } from "@prisma/client";
import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { auth, AuthError } from "../auth/helper";
import { logger } from "../logger";
import { prisma } from "../prisma";

export class ActionError extends Error { }

type handleServerError = (e: Error) => string;

const handleServerError: handleServerError = (e) => {
  if (e instanceof ActionError) {
    logger.info("[DEV] - Action Error", e.message);
    return e.message;
  }

  if (e instanceof AuthError) {
    logger.info("[DEV] - Auth Error", e.message);
    return e.message;
  }

  logger.info("[DEV] - Unknown Error", e);

  return "An unexpected error occurred.";
};

export const action = createSafeActionClient({
  handleServerError,
});

const getUser = async () => {
  const user = await auth();

  if (!user) {
    throw new ActionError("Session not found!");
  }

  if (!user.id || !user.email) {
    throw new ActionError("Session is not valid!");
  }

  return user as User;
};

export const authAction = createSafeActionClient({
  handleServerError,
}).use(async ({ next }) => {
  const user = await getUser();

  return next({
    ctx: {
      user: user as User,
    },
  });
});

export const orgAction = createSafeActionClient({
  handleServerError,
  defineMetadataSchema() {
    return z
      .object({
        roles: z.array(z.nativeEnum(OrganizationMembershipRole)),
      })
      .optional();
  },
}).use(async ({ next, metadata = { roles: [] } }) => {
  try {
    // The approach using headers.get('referer') may be unreliable in Next.js 15
    // Instead, we'll check if there's an orgSlug in the input data 
    // and will otherwise fall back to checking the organization memberships directly

    // First try to get the current user's session
    const session = await auth();
    if (!session?.id) {
      logger.warn("User session not found in orgAction middleware");
      throw new ActionError("Authentication required");
    }

    logger.info(`OrgAction middleware - User authenticated`, {
      userId: session.id,
      userEmail: session.email
    });

    // Function to get organization after we determine which one to use
    const getOrganizationDetails = async (orgId: string) => {
      const organization = await prisma.organization.findUnique({
        where: { id: orgId },
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
              userId: session.id
            },
            select: {
              roles: true
            }
          }
        }
      });

      if (!organization) {
        logger.warn("Organization not found", { orgId });
        throw new ActionError("Organization not found");
      }

      // Check roles if required
      if (metadata.roles && metadata.roles.length > 0) {
        const userRoles = organization.members[0]?.roles || [];
        const hasRequiredRole = metadata.roles.some(role => userRoles.includes(role));

        if (!hasRequiredRole) {
          logger.warn("User does not have required role", {
            userId: session.id,
            requiredRoles: metadata.roles,
            userRoles
          });
          throw new ActionError("You don't have permission to perform this action");
        }
      }

      return {
        ...organization,
        roles: organization.members[0]?.roles || []
      };
    };

    // Get all the user's organizations
    const memberships = await prisma.organizationMembership.findMany({
      where: { userId: session.id },
      select: {
        organization: {
          select: {
            id: true,
            slug: true,
          }
        }
      }
    });

    if (memberships.length === 0) {
      logger.warn("User has no organization memberships", { userId: session.id });
      throw new ActionError("You need to be part of an organization to access this resource");
    }

    // For now, use the first organization
    const firstOrgId = memberships[0].organization.id;
    const org = await getOrganizationDetails(firstOrgId);

    logger.info(`OrgAction middleware - Using organization`, {
      userId: session.id,
      orgId: org.id,
      orgSlug: org.slug,
    });

    return next({
      ctx: org,
    });
  } catch (error) {
    logger.error("OrgAction middleware error", {
      error: error instanceof Error ? error.message : String(error)
    });

    if (error instanceof ActionError) {
      throw error;
    }

    throw new ActionError(
      "You need to be part of an organization to access this resource."
    );
  }
});
