import type { User } from "@prisma/client";
import { nanoid } from "nanoid";
import { Session } from "next-auth";
import { cache } from "react";
import { logger } from "@/lib/logger";
import { auth } from "@/lib/auth/auth";
import crypto from "crypto";
import { env } from "@/lib/env";
import { queryCache } from '@/lib/cache/query-cache';
import { prisma } from "@/lib/prisma";

// Re-export auth with proper typing
export { auth };

// Hash utilities
export const hashStringWithSalt = (string: string, salt: string): string => {
  const hash = crypto.createHash('sha256');
  hash.update(string + salt);
  return hash.digest('hex');
};

// Session management
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export const requiredAuth = async () => {
  const session = await auth();
  if (!session?.user) {
    throw new AuthError("You must be authenticated to access this resource.");
  }
  return session;
};

export async function validateRequest() {
  const sessionKey = 'current-session';
  
  try {
    // Try to get session from cache first
    const cachedSession = await queryCache.query(
      sessionKey,
      async () => {
        try {
          const session = await auth();
          if (!session) {
            throw new Error('No session returned from auth');
          }
          return session;
        } catch (error) {
          logger.error('Error in auth:', error);
          throw error;
        }
      },
      {
        ttl: 60 * 5, // Cache for 5 minutes
        forceFresh: false,
      }
    );

    // Validate the session
    if (!cachedSession?.user) {
      // If cache fails, try direct auth as fallback
      const directSession = await auth();
      if (!directSession?.user) {
        throw new AuthError('No valid session found');
      }
      return directSession;
    }

    return cachedSession;
  } catch (error) {
    logger.error('Error in validateRequest:', error);
    throw new AuthError('Authentication failed');
  }
}

export async function getSession(): Promise<Session | null> {
  logger.info("[Auth] Getting session");
  const session = await auth();
  
  if (!session?.user) {
    logger.warn("[Auth] No session or missing user");
    return null;
  }

  logger.info("[Auth] Session retrieved successfully", { 
    hasId: !!session.user.id 
  });
  
  return session;
}

export async function getCurrentUser() {
  logger.info("[Auth] Getting current user");
  try {
    const session = await auth();
    if (!session?.user) {
      logger.warn("[Auth] No user in session");
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      logger.warn("[Auth] User not found in database", { email: session.user.email });
      return null;
    }

    return user;
  } catch (error) {
    logger.error("[Auth] Error getting current user", { error });
    return null;
  }
}

// OAuth utilities
export const OAUTH_CONFIG = {
  stateExpiration: 10 * 60 * 1000, // 10 minutes
  providers: ['google', 'twitter'] as const,
  requiredScopes: {
    google: ['openid', 'profile', 'email'],
    twitter: ['users.read', 'tweet.read', 'offline.access']
  }
};

export type OAuthProvider = typeof OAUTH_CONFIG.providers[number];
export type OAuthTokens = {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  id_token?: string;
};

export const isValidProvider = (provider: string): provider is OAuthProvider => {
  return OAUTH_CONFIG.providers.includes(provider as OAuthProvider);
};

export const getProviderConfig = (provider: OAuthProvider) => {
  const configs = {
    google: {
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      clientId: env.GOOGLE_ID,
      clientSecret: env.GOOGLE_SECRET,
    },
    twitter: {
      tokenEndpoint: 'https://api.twitter.com/2/oauth2/token',
      clientId: env.TWITTER_ID,
      clientSecret: env.TWITTER_SECRET,
    }
  };
  return configs[provider];
};