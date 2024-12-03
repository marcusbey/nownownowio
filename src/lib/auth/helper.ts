import type { User } from "@prisma/client";
import { nanoid } from "nanoid";
import { Session } from "next-auth";
import { cache } from "react";
import { logger } from "../logger";
import { baseAuth } from "./auth";
import crypto from "crypto";
import { env } from "../env";

// Password validation
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true
};

export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  if (!password) {
    return { isValid: false, error: "Password is required" };
  }

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    return { isValid: false, error: `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters` };
  }

  if (!PASSWORD_REGEX.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one letter, one number, and one special character"
    };
  }

  return { isValid: true };
};

// Hash utilities
export const hashStringWithSalt = (string: string, salt: string): string => {
  const hash = crypto.createHash("sha256");
  const saltedString = salt + string;
  hash.update(saltedString);
  return hash.digest("hex");
};

// Session management
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export const auth = async () => {
  const session = await baseAuth();
  if (session?.user) {
    const user = session.user as User;
    return user;
  }
  return null;
};

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

export const validateRequest = cache(
  async (): Promise<{ user: User; session: Session } | { user: null; session: null }> => {
    const session = await baseAuth();

    if (session?.user) {
      const user = session.user as User;
      return { user, session };
    }

    return { user: null, session: null };
  }
);

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
    const authSession = await baseAuth();
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