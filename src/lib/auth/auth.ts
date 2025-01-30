import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { getNextAuthConfigProviders } from "@/lib/auth/getNextAuthConfigProviders";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { setupDefaultOrganizationsOrInviteUser } from "@/lib/auth/auth-config-setup";
import type { NextAuthConfig, User, Session, DefaultSession } from "next-auth";
import { isValidProvider, getProviderConfig, type OAuthProvider, type OAuthTokens } from "@/lib/auth/helper";
import { getCachedSession, setCachedSession, type CachedSession } from '@/lib/auth/session-cache';

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      name?: string;
      image?: string;
      displayName?: string;
      bio?: string;
    } & DefaultSession["user"]
  }
}

const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers: getNextAuthConfigProviders(),
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/orgs",
  },
  callbacks: {
    async session({ session, user }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
        },
      };
    },
    async jwt({ token, user, account }) {
      try {
        if (account && user) {
          return {
            ...token,
            userId: user.id,
            provider: account.provider,
          };
        }
        return token;
      } catch (error) {
        logger.error("[Auth] JWT callback error", { error });
        return token;
      }
    },
  },
  events: {
    async signIn({ user }) {
      logger.info("[Auth] User signed in", {
        userId: user.id,
      });
    },
    async createUser({ user }) {
      logger.info("[Auth] User created", {
        userId: user.id,
      });
    },
    async linkAccount({ user, account }) {
      logger.info("[Auth] Account linked", {
        userId: user.id,
        provider: account.provider,
      });
    },
    async session({ session }) {
      if (session?.user) {
        logger.info("[Auth] Session created", {
          userId: session.user.id,
        });
      }
    },
  },
  secret: env.NEXTAUTH_SECRET,
  trustHost: true,
  debug: process.env.NODE_ENV === "development",
} satisfies NextAuthConfig;

export const { auth, signIn, signOut, handlers } = NextAuth(authConfig);

// Export auth config for use in API routes
export const authOptions = {
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
  callbacks: authConfig.callbacks,
  events: {
    async createUser({ user }: { user: User }) {
      await setupDefaultOrganizationsOrInviteUser(user);
    },
  },
  secret: env.NEXTAUTH_SECRET,
  trustHost: true,
  debug: false,
};

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
