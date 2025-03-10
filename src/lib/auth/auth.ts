import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import { env } from "../env";
import { logger } from "../logger";
import { prisma } from "../prisma";
import {
  setupDefaultOrganizationsOrInviteUser,
  setupResendCustomer,
} from "./auth-config-setup";
import {
  credentialsOverrideJwt,
  credentialsSignInCallback,
} from "./credentials-provider";
import { getNextAuthConfigProviders } from "./getNextAuthConfigProviders";
import { setupUserDisplayName } from "./user-setup";
import { sendEmail } from "../mail/sendEmail";
import VerifyEmail from "@/emails/verify-email.email";
import { SiteConfig } from "@/site-config";
import { nanoid } from "nanoid";

export const { handlers, auth: baseAuth } = NextAuth((req) => ({
  prefix: "/api/v1",
  basePath: "/api/v1/auth",
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/orgs",
  },
  adapter: PrismaAdapter(prisma),
  providers: getNextAuthConfigProviders(),
  session: {
    strategy: "database",
  },
  secret: env.AUTH_SECRET,
  callbacks: {
    session: async ({ session, user }) => {
      try {
        if (!session || !session.user) {
          console.error("Session callback - Invalid session or missing user in session");
          return session;
        }

        if (!user) {
          console.error("Session callback - Missing user data");
          return session;
        }

        // Add user data to session
        session.user.id = user.id;
        session.user.email = user.email;
        session.user.name = user.name;
        session.user.image = user.image;
        // Remove sensitive data
        // @ts-expect-error - NextAuth doesn't know about this property
        session.user.passwordHash = null;

        // Add debug logging
        console.log("Session callback - user data:", {
          id: user.id,
          email: user.email,
          name: user.name,
          hasImage: !!user.image,
          sessionValid: !!session && !!session.user
        });

        return session;
      } catch (error) {
        console.error("Session callback - Error:", error);
        return session;
      }
    },
  },
  events: {
    signIn: async (message) => {
      // First handle the standard credential sign-in callback
      if (req && typeof credentialsSignInCallback === 'function') {
        const callback = credentialsSignInCallback(req);
        if (typeof callback === 'function') {
          await callback(message);
        }
      }
      
      // Then check if we need to send a verification email
      const { user, account } = message;
      if (!user || !user.email || !user.id) return;
      
      // Only proceed for credentials provider and if email isn't verified
      if (account && account.provider === 'credentials') {
        // Get the user with emailVerified status
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { emailVerified: true, email: true }
        });
        
        // If email is not verified, send verification email
        if (dbUser && !dbUser.emailVerified) {
          try {
            // Generate verification token
            const token = nanoid(32);
            const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
            
            // Create verification token in database
            await prisma.verificationToken.create({
              data: {
                identifier: dbUser.email || user.email,
                token,
                expires,
              },
            });
            
            // Create verification URL
            const verificationUrl = `${env.NEXT_PUBLIC_BASE_URL}/auth/verify/${token}`;
            
            // Send verification email
            await sendEmail({
              to: dbUser.email || user.email,
              subject: `Verify your email for ${SiteConfig.title}`,
              react: VerifyEmail({ url: verificationUrl }),
            });
          } catch (error) {
            // Use logger instead of console.error for consistent error handling
            logger.error('[Auth] Failed to send verification email', { error });
          }
        }
      }
    },
    createUser: async ({ user }) => {
      if (!user.email) {
        return;
      }

      const resendContactId = await setupResendCustomer(user);

      await setupDefaultOrganizationsOrInviteUser(user);

      // Get the user's accounts to check if they used an OAuth provider
      const accounts = await prisma.account.findMany({
        where: {
          userId: user.id,
        },
      });

      // Prepare update data
      const updateData: {
        resendContactId?: string;
        emailVerified?: Date;
      } = {
        resendContactId,
      };
      
      // Set emailVerified to true for OAuth providers (Google, Twitter, etc.)
      const hasOAuthAccount = accounts.some(account => 
        account.provider !== 'credentials'
      );
      
      if (hasOAuthAccount) {
        updateData.emailVerified = new Date();
      }

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: updateData,
      });
      
      // Set up the user's display name
      if (user.id) {
        await setupUserDisplayName(user.id);
      }
    },
  },
  jwt: credentialsOverrideJwt,
}));
