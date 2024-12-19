import type { User } from "next-auth";
import { z } from "zod";
import { createOrganizationQuery } from "../../query/org/org-create.query";
import { env } from "../env";
import { getNameFromEmail, getSlugFromUser } from "../format/id";
import { resend } from "../mail/resend";
import { prisma } from "../prisma";
import { logger } from "../logger"; // Assuming logger is imported from another file

export const setupResendCustomer = async (user: User) => {
  try {
    if (!user.email) {
      logger.error("setupResendCustomer: No email provided", { user });
      return;
    }

    if (!env.RESEND_AUDIENCE_ID) {
      logger.error("setupResendCustomer: No RESEND_AUDIENCE_ID configured");
      return;
    }

    const contact = await resend.contacts.create({
      audienceId: env.RESEND_AUDIENCE_ID,
      email: user.email,
      firstName: user.name ?? "",
      unsubscribed: false,
    });

    if (!contact.data) {
      logger.error("setupResendCustomer: Failed to create contact", { 
        error: contact.error,
        email: user.email 
      });
      return;
    }

    return contact.data.id;
  } catch (error) {
    logger.error("setupResendCustomer: Unexpected error", { error, user });
    return;
  }
};

const TokenSchema = z.object({
  orgId: z.string(),
});

export const setupDefaultOrganizationsOrInviteUser = async (user: User) => {
  if (!user.email || !user.id) {
    logger.error("setupDefaultOrganizationsOrInviteUser: Missing user email or id", { user });
    return;
  }

  try {
    // Check for existing organizations
    const existingOrgs = await prisma.organizationMembership.count({
      where: {
        userId: user.id,
      },
    });

    // If user has no organizations, create a default one
    if (existingOrgs === 0) {
      const orgSlug = getSlugFromUser(user);
      const orgName = `${user.name || getNameFromEmail(user.email)}'s Organization`;
      
      logger.info("Creating default organization", { 
        userId: user.id,
        orgSlug,
        orgName 
      });

      await createOrganizationQuery({
        slug: orgSlug,
        name: orgName,
        email: user.email,
        image: user.image,
        members: {
          create: {
            userId: user.id,
            roles: ["OWNER"],
          },
        },
      });

      logger.info("Default organization created successfully", { 
        userId: user.id,
        orgSlug 
      });
    }

    // Handle any pending invitations
    const tokens = await prisma.verificationToken.findMany({
      where: {
        identifier: {
          startsWith: `${user.email}-invite-`,
        },
      },
    });

    for await (const token of tokens) {
      try {
        const tokenData = TokenSchema.parse(token.data);

        if (tokenData.orgId) {
          await prisma.organizationMembership.create({
            data: {
              organizationId: tokenData.orgId,
              userId: user.id,
              roles: ["MEMBER"],
            },
          });
          await prisma.verificationToken.delete({
            where: {
              token: token.token,
            },
          });
        }
      } catch (error) {
        logger.error("Error processing invitation token", { 
          error,
          token,
          userId: user.id 
        });
      }
    }
  } catch (error) {
    logger.error("Error in setupDefaultOrganizationsOrInviteUser", { 
      error,
      userId: user.id 
    });
    throw error; // Re-throw to ensure we know if this fails
  }
};
