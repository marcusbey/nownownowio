import type { User } from "@prisma/client";
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
  console.log("Calling baseAuth...");
  const session = await baseAuth();
  console.log("Session result:", session);
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