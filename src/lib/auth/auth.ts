// import { PrismaAdapter } from "@auth/prisma-adapter";
import VerifyEmail from "@/emails/verify-email.email";
import { SiteConfig } from "@/site-config";
import { nanoid } from "nanoid";
import type { Session } from "next-auth";
import NextAuth from "next-auth";
import type { AdapterUser } from "next-auth/adapters";
import { env } from "../env";
import { logger } from "../logger";
import { sendEmail } from "../mail/sendEmail";
import { prisma } from "../prisma";
import {
  setupDefaultOrganizationsOrInviteUser,
  setupResendCustomer,
} from "./auth-config-setup";
import {
  credentialsOverrideJwt,
  credentialsSignInCallback,
} from "./credentials-provider";
import { CustomPrismaAdapter } from "./custom-prisma-adapter";
import { getNextAuthConfigProviders } from "./getNextAuthConfigProviders";
import { setupUserDisplayName } from "./user-setup";

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
  adapter: CustomPrismaAdapter(prisma),
  providers: getNextAuthConfigProviders(),
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  debug: process.env.NODE_ENV === "development",
  secret: env.AUTH_SECRET,
  callbacks: {
    session: async ({ session, user }) => {
      try {
        // Enhanced logging for Next.js 15 session debugging
        logger.info("Session callback - raw data", {
          // These conditionals are necessary for runtime safety
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          sessionData: session ? 'present' : 'missing',
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          userData: user ? 'present' : 'missing',
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          sessionHasUser: session && 'user' in session ? 'yes' : 'no',
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          userDetails: user ? { id: user.id, email: user.email } : 'no user data'
        });

        // Session will always exist at this point due to the callback structure
        // Removed unreachable condition (!session) as it's impossible per NextAuth's implementation

        // CRITICAL: Handle orphaned sessions (cookie exists but DB session is gone)
        // This happens when the database is wiped but the cookie remains
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!user) {
          logger.warn("Session callback - Orphaned session detected (cookie exists but no user found in database)");
          // Set a flag on the session to indicate it's invalid (client can handle this accordingly)
          // Use type assertion with the Session type from nextauth.d.ts
          (session as Session).isOrphanedSession = true;
          return session;
        }

        // Initialize session.user if it doesn't exist
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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

        // We need the passwordHash property to determine if a password is set
        // @ts-expect-error - NextAuth doesn't know about this property
        session.user.passwordHash = user.passwordHash;

        // Add debug logging
        logger.info("Session callback - processed user data", {
          id: user.id,
          email: user.email,
          name: user.name,
          hasImage: !!user.image,
          sessionValid: !!session.user.id
        });

        return session;
      } catch (error) {
        logger.error("Session callback - Error:", error);
        // Return the original session to maintain type compatibility
        return session;
      }
    },
    signIn: async ({ user, account }) => {
      // First handle the standard credential sign-in callback
      if (typeof credentialsSignInCallback === 'function') {
        const callback = credentialsSignInCallback(req);
        if (typeof callback === 'function') {
          await callback({ user, account });
        }
      }

      // Then check if we need to send a verification email
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!user?.email || !user?.id) return false;

      // For OAuth providers, we want to redirect to the org page if available
      if (account?.provider !== 'credentials') {
        const orgSlug = await setupDefaultOrganizationsOrInviteUser(user);
        if (orgSlug) {
          // Store the redirect URL in NextAuth's internal state
          await prisma.verificationToken.create({
            data: {
              identifier: `${user.id}-redirect`,
              token: nanoid(),
              expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
              data: { redirectUrl: `/orgs/${orgSlug}` },
            },
          });
        }
      }

      // Only proceed for credentials provider and if email isn't verified
      if (account?.provider === 'credentials') {
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

      return true;
    },
    createUser: async ({ user }: { user: AdapterUser }) => {
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
      }

      // Update the user with the generated data
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

// Re-export baseAuth as auth to maintain compatibility with imports
export const auth = baseAuth;
