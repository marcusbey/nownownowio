import type { User } from "@prisma/client";
import { redirect } from "next/navigation";
import { baseAuth } from "./auth";
import { cache } from "react";
import { logger } from "../logger";

const isServer = typeof window === "undefined";

export class AuthError extends Error {}

/**
 * Cached authentication function that retrieves the current user session
 * This is the single source of truth for authentication in the application
 * Using React's cache function to avoid multiple database requests
 */
export const auth = cache(async (): Promise<User | null> => {
  try {
    const session = await baseAuth();

    if (session?.user) {
      const user = session.user as User;
      return user;
    }

    return null;
  } catch (error) {
    logger.error('Auth error:', { error });
    return null;
  }
});

/**
 * Get the full session object including user data
 * This is cached to prevent multiple database queries
 */
export const getSession = cache(async () => {
  try {
    const session = await baseAuth();
    return session;
  } catch (error) {
    logger.error('Session retrieval error:', { error });
    return null;
  }
});

/**
 * Require authentication or redirect to sign in
 * Uses the cached auth function to prevent multiple database queries
 */
export const requiredAuth = async (): Promise<User> => {
  const user = await auth();

  if (!user) {
    redirect("/auth/signin");
  }

  return user;
};

/**
 * Validate the current request and return the user
 * This is used in server actions and API routes
 */
export const validateRequest = cache(async (): Promise<{ user: User } | { user: null }> => {
  try {
    const user = await auth();
    
    if (!user) {
      return { user: null };
    }
    
    return { user };
  } catch (error) {
    logger.error('Request validation error:', { error });
    return { user: null };
  }
});
