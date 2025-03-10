import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import type { Session } from "next-auth";
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
    // This will be dynamically overridden in the createUser event
    // Default fallback if we can't determine the org slug
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
        // Enhanced logging for Next.js 15 session debugging
        // Log session data for debugging
        // Session is always an object in this context
        const hasUserProperty = 'user' in session;
        
        logger.info("Session callback - raw data", {
          sessionExists: Boolean(session),
          userExists: Boolean(user),
          sessionHasUser: hasUserProperty
        });

        // Session will always exist at this point due to the callback structure
        // but we'll log if it's unexpectedly empty
        if (!session) {
          logger.error("Session callback - No session object");
          // Return a minimal valid session object to maintain type compatibility
          return { expires: new Date(Date.now() + 2 * 86400).toISOString() };
        }

        // CRITICAL: Detect orphaned sessions (cookie exists but DB session is gone)
        // This happens when the database is wiped but the cookie remains
        if (!user) {
          logger.warn("Session callback - Orphaned session detected (cookie exists but no user found in database)");
          // Set a flag on the session to indicate it's invalid (client can handle this accordingly)
          // Use type assertion with the Session type from nextauth.d.ts
          (session as Session).isOrphanedSession = true;
          return session;
        }

        // Initialize session.user if it doesn't exist
        if (!session.user) {
          logger.info("Session callback - Initializing missing session.user");
          // Create a minimal user object that meets the type requirements
          session.user = { 
            id: "", // Required by AdapterUser
            name: null,
            email: "", 
            image: null,
            emailVerified: null // Required by AdapterUser
          };
        }

        // Add user data to session - using explicit properties to ensure type safety
        session.user.id = user.id;
        session.user.email = user.email;
        session.user.name = user.name;
        session.user.image = user.image;
        
        // Remove sensitive data
        // @ts-expect-error - NextAuth doesn't know about this property
        session.user.passwordHash = null;

        // Add debug logging
        logger.info("Session callback - processed user data", {
          id: user.id,
          email: user.email,
          name: user.name,
          hasImage: !!user.image,
          sessionValid: !!session && !!session.user && !!session.user.id
        });

        return session;
      } catch (error) {
        logger.error("Session callback - Error:", error);
        // Return the original session to maintain type compatibility
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
      if (!user.email || !user.id) {
        return;
      }

      const resendContactId = await setupResendCustomer(user);

      // Get the organization slug for the new user
      const orgSlug = await setupDefaultOrganizationsOrInviteUser(user);
      
      // If we have an organization slug, store it in a verification token to use for redirection
      if (orgSlug) {
        // Store the redirect URL in NextAuth's internal state
        // This will override the newUser setting in the config
        await prisma.verificationToken.create({
          data: {
            identifier: `${user.id}-redirect`,
            token: nanoid(),
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            data: { redirectUrl: `/orgs/${orgSlug}` },
          },
        });
      }

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
        
        // Update the user with the generated data
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: updateData,
        });
        
        // Set up display name for OAuth users
        await setupUserDisplayName(user.id);
        
        return;
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
