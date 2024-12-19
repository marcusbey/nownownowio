"use server";

import { ActionError, action } from "@/lib/actions/safe-actions";
import {
  setupDefaultOrganizationsOrInviteUser,
  setupResendCustomer,
} from "@/lib/auth/auth-config-setup";
import {
  hashStringWithSalt,
  validatePassword,
} from "@/lib/auth/credentials-provider";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { LoginCredentialsFormScheme } from "./signup.schema";
import logger from "@/lib/logger";

export const signUpAction = action
  .schema(LoginCredentialsFormScheme)
  .action(async ({ parsedInput: { email, password, name } }) => {
    if (!validatePassword(password)) {
      throw new ActionError(
        "Invalid new password. Must be at least 8 characters, and contain at least one letter and one number",
      );
    }

    try {
      const userData = {
        email,
        passwordHash: hashStringWithSalt(password, env.NEXTAUTH_SECRET),
        name,
      };

      const resendContactId = await setupResendCustomer(userData);

      const user = await prisma.user.create({
        data: {
          ...userData,
          resendContactId,
        },
      });

      // Handle any pending invitations
      await setupDefaultOrganizationsOrInviteUser(user);

      // If there's a pending invitation, we'll be redirected to it
      // Otherwise, redirect to the organizations page
      redirect("/orgs");

      return user;
    } catch (error) {
      logger.error("Failed to sign up user", { error, email });
      if (error instanceof Error) {
        throw new ActionError(error.message);
      }
      throw new ActionError("Failed to create account");
    }
  });
