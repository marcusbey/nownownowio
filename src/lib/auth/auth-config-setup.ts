import type { User } from "next-auth";
import { z } from "zod";
import { createOrganizationQuery } from "../../query/org/org-create.query";
import { env } from "../env";
import { getNameFromEmail, getSlugFromUser } from "../format/id";
import { getResendInstance } from "../mail/resend";
import { prisma } from "../prisma";
import { logger } from "../logger";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { getServerUrl } from "../server-url";

export const setupResendCustomer = async (user: User) => {
  try {
    if (!user.email) {
      logger.error("setupResendCustomer: No email provided", { user });
      return;
    }

    const resendClient = await getResendInstance();
    const contact = await resendClient.contacts.create({
      email: user.email,
      firstName: user.name ?? "",
      lastName: "",
      unsubscribed: false,
      audienceId: env.RESEND_AUDIENCE_ID,
    }) as { error?: { message: string }; email?: string };

    if ('error' in contact || !contact) {
      logger.error("setupResendCustomer: Failed to create contact", { 
        error: 'error' in contact ? contact.error : 'No contact returned',
        email: user.email 
      });
      return;
    }

    return contact.email;
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
    throw error;
  }
};

export async function getAuthConfig() {
  const resendClient = await getResendInstance();
  
  return {
    adapter: PrismaAdapter(prisma),
    session: {
      strategy: "jwt",
    },
    pages: {
      signIn: "/auth/signin",
      signOut: "/auth/signout",
      error: "/auth/error",
      verifyRequest: "/auth/verify-request",
      newUser: "/auth/new-user",
    },
    providers: [
      {
        id: "email",
        type: "email",
        from: env.RESEND_EMAIL_FROM,
        server: "",
        maxAge: 24 * 60 * 60,
        async sendVerificationRequest({ 
          identifier,
          url 
        }: { 
          identifier: string;
          url: string;
        }) {
          try {
            await resendClient.emails.send({
              from: env.RESEND_EMAIL_FROM,
              to: [identifier],
              subject: "Sign in to NowNowNow",
              html: `Click <a href="${url}">here</a> to sign in to NowNowNow.`,
            });
          } catch (error) {
            logger.error("[auth] Failed to send verification email", { error });
            throw new Error("Failed to send verification email");
          }
        },
      },
    ],
    callbacks: {
      async signIn({ 
        user 
      }: { 
        user: { 
          email: string;
          name?: string;
        }
      }) {
        await setupResendCustomer(user);
        await setupDefaultOrganizationsOrInviteUser(user);
        return true;
      },
      async session({ 
        session,
        token 
      }: { 
        session: { 
          user?: { 
            id?: string;
          }
        };
        token: {
          sub?: string;
        }
      }) {
        if (token.sub && session.user) {
          session.user.id = token.sub;
        }
        return session;
      },
    },
  };
}
