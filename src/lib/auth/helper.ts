import type { User } from "@prisma/client";
import { redirect } from "next/navigation";
import { baseAuth } from "./auth";
import { cache } from "react";
import { logger } from "../logger";
import type { Session } from "next-auth";

export class AuthError extends Error {}

/**
 * Cached authentication function that retrieves the current user session
 * This is the single source of truth for authentication in the application
 * Using React's cache function to avoid multiple database requests
 */
export const auth = cache(async (): Promise<User | null> => {
  try {
    const session = await baseAuth() as Session | null;
    
    // Enhanced debug logging with more details
    logger.info('Auth helper - session data:', { 
      hasSession: !!session, 
      hasUser: !!session?.user,
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      userEmail: session && session.user ? session.user.email : undefined,
      // Only access Object.keys when session exists
      sessionKeys: session ? Object.keys(session) : [],
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      userKeys: session && session.user ? Object.keys(session.user) : [],
      // Check if session has custom property added in auth.ts
      isOrphanedSession: session ? 'isOrphanedSession' in session : false
    });

    if (session?.user) {
      const user = session.user as User;
      
      // Validate user object
      if (!user.id || !user.email) {
        logger.error('Auth helper - Invalid user object in session', { 
          hasId: !!user.id, 
          hasEmail: !!user.email,
          userObject: JSON.stringify(user)
        });
        return null;
      }
      
      // Log successful authentication
      logger.info('Auth helper - Valid user authenticated', {
        userId: user.id,
        email: user.email
      });
      
      return user;
    }
    
    logger.warn('Auth helper - No user in session');
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
