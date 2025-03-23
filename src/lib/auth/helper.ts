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
 * @param bustCache Optional parameter to clear the cache when true
 */
export const auth = cache(async (bustCache = false): Promise<User | null> => {
  // Clear the cache if requested (used during sign-out)
  if (bustCache) {
    // @ts-expect-error - Accessing internal cache property
    if (auth.cache instanceof Map) {
      // @ts-expect-error - Accessing internal cache property
      auth.cache.clear();
      logger.info('Auth helper - cache cleared');
    }
  }
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
 * @param bustCache Optional parameter to clear the cache when true
 */
export const getSession = cache(async (bustCache = false) => {
  // Clear the cache if requested (used during sign-out)
  if (bustCache) {
    // @ts-expect-error - Accessing internal cache property
    if (getSession.cache instanceof Map) {
      // @ts-expect-error - Accessing internal cache property
      getSession.cache.clear();
      logger.info('GetSession helper - cache cleared');
    }
  }
  
  try {
    const session = await baseAuth();
    
    // Log session details for debugging
    logger.info('GetSession helper - retrieved session', { 
      hasSession: !!session,
      // Use type-safe property access
      userId: session?.user?.id,
      // Check for custom property added in auth.ts
      isOrphanedSession: session ? 'isOrphanedSession' in session : false
    });
    
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
 * @param bustCache Optional parameter to clear the cache when true
 */
export const validateRequest = cache(async (bustCache = false): Promise<{ user: User } | { user: null }> => {
  // Clear the cache if requested (used during sign-out)
  if (bustCache) {
    // @ts-expect-error - Accessing internal cache property
    if (validateRequest.cache instanceof Map) {
      // @ts-expect-error - Accessing internal cache property
      validateRequest.cache.clear();
      logger.info('ValidateRequest helper - cache cleared');
    }
  }
  
  try {
    // Pass the bustCache parameter to auth() to ensure cache consistency
    const user = await auth(bustCache);
    
    if (!user) {
      return { user: null };
    }
    
    return { user };
  } catch (error) {
    logger.error('Request validation error:', { error });
    return { user: null };
  }
});
