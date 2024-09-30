import type { User } from "@prisma/client";
import { nanoid } from "nanoid";
import { Session } from "next-auth";
import { cache } from "react";
import { logger } from "../logger";
import { baseAuth } from "./auth";

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
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
  async (): Promise<
    { user: User; session: Session } | { user: null; session: null }
  > => {
    const session = await baseAuth();

    if (session?.user) {
      const user = session.user as User;
      return {
        user,
        session,
      };
    }

    return {
      user: null,
      session: null,
    };
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
    console.error("[getSession] Error in getSession function:", error);
    cachedSession = null;
    return null;
  }
}