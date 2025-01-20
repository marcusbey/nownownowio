import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "../prisma";
import { getNextAuthConfigProviders } from "./getNextAuthConfigProviders";
import { env } from "../env";
import { logger } from "../logger";
import { setupDefaultOrganizationsOrInviteUser } from "./auth-config-setup";
import type { NextAuthConfig, User, Session, DefaultSession } from "next-auth";
import { isValidProvider, getProviderConfig, type OAuthProvider, type OAuthTokens } from "./helper";
import { getCachedSession, setCachedSession, type CachedSession } from './session-cache'

const config: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: getNextAuthConfigProviders(),
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/orgs",
  },
  session: {
    strategy: "database",
    maxAge: 365 * 24 * 60 * 60, // 1 year
    updateAge: 7 * 24 * 60 * 60, // Refresh weekly
  },
  callbacks: {
    async session({ session, user }: { session: DefaultSession; user: User }) {
      if (!user?.id) {
        throw new Error('User ID is required')
      }

      const enhancedSession = {
        ...session,
        user: {
          ...session.user,
          id: user.id,
        },
      } as const
      
      // Cache the session
      if (session.user?.email) {
        setCachedSession(session.user.email, enhancedSession)
      }
      
      return enhancedSession
    },
    async signIn({ user, account, profile }) {
      if (!user.email) {
        logger.error("[Auth] Sign in failed: No email provided", { user });
        return false;
      }

      try {
        // Check if user exists with this email
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { accounts: true }
        });

        if (existingUser) {
          // If user exists but doesn't have this OAuth account linked
          if (!existingUser.accounts.some(acc => acc.provider === account?.provider)) {
            logger.info("[Auth] Linking new OAuth provider to existing account", {
              email: user.email,
              provider: account?.provider
            });
            
            // Link the new OAuth account
            if (account && existingUser.id) {
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  token_type: account.token_type,
                  scope: account.scope,
                  expires_at: account.expires_at,
                }
              });
            }
          }
          return true;
        }

        return true;
      } catch (error) {
        logger.error("[Auth] Error in signIn callback", { error, user });
        return false;
      }
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      if (process.env.NODE_ENV === "development") {
        return url.startsWith("/") ? `${baseUrl}${url}` : url;
      }
      const urlObj = new URL(url, baseUrl);
      return urlObj.toString();
    },
  },
  events: {
    async createUser({ user }: { user: User }) {
      await setupDefaultOrganizationsOrInviteUser(user);
    },
  },
  secret: env.NEXTAUTH_SECRET,
  trustHost: true,
  debug: false,
};

// Create and export the NextAuth instance
export const { auth, handlers } = NextAuth(config);

// Export auth config for use in API routes
export const authOptions = (req: Request) => ({
  adapter: PrismaAdapter(prisma),
  providers: getNextAuthConfigProviders(),
  callbacks: {
    redirect: async ({ url, baseUrl }: { url: string; baseUrl: string }) => {
      if (process.env.NODE_ENV === "development") {
        return Promise.resolve(url.startsWith("/") ? `${baseUrl}${url}` : url);
      }
      const urlObj = new URL(url, baseUrl);
      return urlObj.toString();
    },
    session: async (params: { session: DefaultSession }) => {
      return params.session;
    },
  },
  secret: env.NEXTAUTH_SECRET,
});

export async function handleOAuthSignIn(profile: {
  email: string;
  provider: string;
  providerAccountId: string;
}) {
  if (!isValidProvider(profile.provider)) {
    throw new Error(`Unsupported provider: ${profile.provider}`);
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: profile.email },
    include: { accounts: true },
  });

  if (existingUser) {
    const existingProvider = existingUser.accounts.find(
      (account) => account.provider === profile.provider
    );

    if (existingProvider) {
      return {
        action: 'signin',
        user: existingUser,
        accounts: existingUser.accounts,
      };
    }

    const newAccount = await prisma.account.create({
      data: {
        userId: existingUser.id,
        type: 'oauth',
        provider: profile.provider,
        providerAccountId: profile.providerAccountId,
      },
    });

    return {
      action: 'merge',
      user: existingUser,
      accounts: [...existingUser.accounts, newAccount],
    };
  }

  const newUser = await prisma.user.create({
    data: {
      email: profile.email,
      emailVerified: new Date(),
    },
  });

  const account = await prisma.account.create({
    data: {
      userId: newUser.id,
      type: 'oauth',
      provider: profile.provider,
      providerAccountId: profile.providerAccountId,
    },
  });

  return {
    action: 'create',
    user: newUser,
    accounts: [account],
  };
}

export async function handleOAuthTokenError({
  error,
  token,
  refreshToken,
}: {
  error: string;
  token: string;
  refreshToken: string;
}) {
  if (error === 'token_expired' && refreshToken) {
    try {
      const account = await prisma.account.findFirst({
        where: { refresh_token: refreshToken },
      });

      if (!account || !isValidProvider(account.provider)) {
        throw new Error('Invalid account or provider');
      }

      const config = getProviderConfig(account.provider as OAuthProvider);
      const response = await fetch(config.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: config.clientId || '',
          client_secret: config.clientSecret || '',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to refresh token: ${response.statusText}`);
      }

      const data = await response.json();
      const newTokens: OAuthTokens = {
        access_token: data.access_token,
        expires_at: Math.floor(Date.now() / 1000) + (data.expires_in || 3600),
        refresh_token: data.refresh_token,
      };

      await prisma.account.update({
        where: { id: account.id },
        data: {
          access_token: newTokens.access_token,
          expires_at: newTokens.expires_at,
          refresh_token: newTokens.refresh_token ?? refreshToken,
        },
      });

      return {
        success: true,
        newToken: newTokens.access_token,
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      return {
        success: false,
        error: 'Failed to refresh token',
      };
    }
  }

  return {
    success: false,
    error: `Unhandled OAuth error: ${error}`,
  };
}

export async function linkProvider({
  userId,
  provider,
  providerAccountId,
}: {
  userId: string;
  provider: string;
  providerAccountId: string;
}) {
  if (!isValidProvider(provider)) {
    return {
      error: 'unsupported_provider',
    };
  }

  const existingAccount = await prisma.account.findFirst({
    where: {
      userId,
      provider,
    },
  });

  if (existingAccount) {
    return {
      error: 'provider_already_linked',
      account: existingAccount,
    };
  }

  const account = await prisma.account.create({
    data: {
      userId,
      type: 'oauth',
      provider,
      providerAccountId,
    },
  });

  return { account };
}
