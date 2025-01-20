import { OrganizationMembershipRole, type User } from "@prisma/client";
import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { auth, AuthError } from "../auth/helper";
import { logger } from "../logger";
import { getRequiredCurrentOrg } from "../organizations/getOrg";

export class ActionError extends Error {
  constructor(message: string) {
    super(message);
  }
}

type handleServerError = (e: Error) => string;

const handleServerError: handleServerError = (e) => {
  if (e instanceof ActionError) {
    logger.info("[DEV] - Action Error", e.message);
    return e.message;
  }

  if (e instanceof AuthError) {
    logger.info("[DEV] - Auth Error", e.message);
    return e.message;
  }

  logger.info("[DEV] - Unknown Error", e);

  return "An unexpected error occurred.";
};

export const action = createSafeActionClient({
  handleServerError,
});

const getUser = async () => {
  const user = await auth();

  if (!user) {
    throw new ActionError("Session not found!");
  }

  if (!user?.user?.id || !user?.user?.email) {
    throw new ActionError("Session is not valid!");
  }

  return {
    id: user.user.id,
    email: user.user.email,
    name: user.user.name || null,
    displayName: user.user.name || null,
    image: user.user.image || null,
    emailVerified: null,
    bio: null,
    resendContactId: null,
    widgetToken: null,
    passwordHash: null,
    createdAt: new Date(),
    updatedAt: new Date()
  } as User;
};

export const authAction = createSafeActionClient({
  handleServerError,
}).use(async ({ next }) => {
  const user = await getUser();

  return next({
    ctx: {
      user: user as User,
    },
  });
});

export const orgAction = createSafeActionClient({
  handleServerError,
  defineMetadataSchema() {
    return z
      .object({
        roles: z.array(z.nativeEnum(OrganizationMembershipRole)),
      })
      .optional();
  },
}).use(async ({ next, metadata = { roles: [] } }) => {
  try {
    const org = await getRequiredCurrentOrg(undefined, metadata.roles);
    if (!org) {
      throw new ActionError("Organization not found");
    }
    return next({
      ctx: org,
    });
  } catch (error) {
    logger.error("Organization access error", { error });
    if (error instanceof Error) {
      throw new ActionError(error.message);
    }
    throw new ActionError("Failed to access organization");
  }
});
