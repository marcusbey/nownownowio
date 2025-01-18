import type { User } from "@prisma/client";
import { nanoid } from "nanoid";
import { Session } from "next-auth";
import { cache } from "react";
import { logger } from "../logger";
import { auth as nextAuth } from "./auth";
import crypto from "crypto";
import { env } from "../env";
import { queryCache } from '@/lib/cache/query-cache';

interface ISession extends Session {
  user: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
  }
}

// Re-export auth with proper typing
export const auth = async (): Promise<ISession | null> => {
  const session = await nextAuth();
  if (!session?.user?.email) {
    return null;
  }
  return session as ISession;
};

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
  try {
    const user = await auth();

    if (!user) {
      logger.error("Authentication failed: No user returned from auth()");
      throw new AuthError("You must be authenticated to access this resource.");
    }

    return user;
  } catch (error) {
    logger.error("Authentication error:", error);
    throw new AuthError("An error occurred during authentication.");
  }
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
    if (!cachedSession || !cachedSession.user) {
      // If cache fails, try direct auth as fallback
      const directSession = await auth();
      if (!directSession || !directSession.user) {
        throw new AuthError('No valid session found');
      }
      return {
        session: directSession,
        user: directSession.user,
      };
    }

    return {
      session: cachedSession,
      user: cachedSession.user,
    };
  } catch (error) {
    logger.error('Error in validateRequest:', error);
    // Try one last direct auth attempt
    try {
      const lastAttemptSession = await auth();
      if (lastAttemptSession?.user) {
        return {
          session: lastAttemptSession,
          user: lastAttemptSession.user,
        };
      }
    } catch (finalError) {
      logger.error('Final auth attempt failed:', finalError);
    }
    throw new AuthError('Authentication failed after all attempts');
  }
}

interface ISession {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
  createdAt: Date;
}

let cachedSession: ISession | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60000; // 1 minute in milliseconds

export async function getSession(): Promise<ISession | null> {
  const now = Date.now();
  if (cachedSession && now - lastFetchTime < CACHE_DURATION) {
    return cachedSession;
  }

  try {
    const authSession = await auth();
    if (authSession && authSession.user) {
      const sessionDoc: ISession = {
        id: authSession.user.id || nanoid(11),
        sessionToken: authSession.sessionToken || '',
        userId: authSession.user.id,
        expires: new Date(authSession.expires),
        createdAt: new Date()
      };

      cachedSession = sessionDoc;
      lastFetchTime = now;
      return sessionDoc;
    }

    cachedSession = null;
    return null;
  } catch (error) {
    logger.error("[getSession] Error in getSession function:", error);
    cachedSession = null;
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

export interface OAuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
}

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
    },
  };

  return configs[provider];
};