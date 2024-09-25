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
  //console.log("helper ______ Calling baseAuth...");
  const session = await baseAuth();
  //console.log("helper ______ Session result:", session);
  //console.log(" user _______ user from sessions", session?.user)
  if (session?.user) {
    const user = session.user as User;
    //console.log("helper ______ User:", user);
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

    //console.log("requiredAuth ______ User:", user);
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
      //console.log("validateRequest ______ User:", user);
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
  if (cachedSession && (now - lastFetchTime) < CACHE_DURATION) {
    //console.log("Returning cached session:", cachedSession);
    return cachedSession;
  }

  try {
    const authSession = await baseAuth();
    //console.log("authSession:", authSession);
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
      //console.log("New session cached:", sessionDoc);
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
