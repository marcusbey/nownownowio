"use server";

import { MarkdownEmail } from "@/emails/markdown.email";
import { isActionSuccessful } from "@/lib/actions/actions-utils";
import { ActionError, authAction } from "@/lib/actions/safe-actions";
import {
  hashStringWithSalt,
  validatePassword,
} from "@/lib/auth/credentials-provider";
import { requiredAuth } from "@/lib/auth/helper";
import { env } from "@/lib/env";
import { sendEmail } from "@/lib/mail/sendEmail";
import { prisma } from "@/lib/prisma";
import { addHours } from "date-fns";
import { nanoid } from "nanoid";
import { z } from "zod";
import {
  EditPasswordFormSchema,
  ProfileFormSchema,
  SetInitialPasswordFormSchema,
} from "./edit-profile.schema";

export const updateProfileAction = authAction
  .schema(ProfileFormSchema.and(z.object({ token: z.string().optional() })))
  .action(async ({ parsedInput: input, ctx }) => {
    const previousEmail = ctx.user.email;

    const isUpdatingEmail = previousEmail !== input.email;

    // Verify that the user is updating his email with a valid token
    if (isUpdatingEmail) {
      if (!input.token) {
        throw new ActionError("Missing token");
      }

      const result = await verifyUpdateEmailTokenAction({
        token: input.token,
      });

      if (!isActionSuccessful(result)) {
        throw new ActionError(result?.serverError ?? "Unknown error");
      }

      if (!result.data.valid) {
        throw new ActionError("Invalid token");
      }
    }

    const user = await prisma.user.update({
      where: {
        id: ctx.user.id,
      },
      data: {
        name: input.name,
        displayName: input.displayName,
        email: input.email,
        image: input.image,
        emailVerified: previousEmail === input.email ? undefined : null,
      },
    });

    return user;
  });

export const editPasswordAction = authAction
  .schema(EditPasswordFormSchema)
  .action(async ({ parsedInput: input, ctx }) => {
    const user = await requiredAuth();
    const { passwordHash } = await prisma.user.findUniqueOrThrow({
      where: {
        id: user.id,
      },
      select: {
        passwordHash: true,
      },
    });

    if (input.newPassword !== input.confirmPassword) {
      throw new ActionError("Passwords do not match");
    }

    if (
      hashStringWithSalt(input.currentPassword, env.AUTH_SECRET) !==
      passwordHash
    ) {
      throw new ActionError("Invalid current password");
    }

    if (!validatePassword(input.newPassword)) {
      throw new ActionError(
        "Invalid new password. Must be at least 8 characters, and contain at least one letter and one number",
      );
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: ctx.user.id,
      },
      data: {
        passwordHash: hashStringWithSalt(input.newPassword, env.AUTH_SECRET),
      },
      select: {
        id: true,
      },
    });

    return updatedUser;
  });

export const setInitialPasswordAction = authAction
  .schema(SetInitialPasswordFormSchema)
  .action(async ({ parsedInput: input, ctx }) => {
    // Check if user already has a password
    const user = await prisma.user.findUnique({
      where: {
        id: ctx.user.id,
      },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!user) {
      throw new ActionError("User not found");
    }

    if (user.passwordHash) {
      throw new ActionError("Password already set. Please use the change password form.");
    }

    if (input.newPassword !== input.confirmPassword) {
      throw new ActionError("Passwords don't match");
    }

    if (!validatePassword(input.newPassword)) {
      throw new ActionError(
        "Invalid password. Must be at least 8 characters, and contain at least one letter and one number",
      );
    }

    // Hash new password
    const newPasswordHash = hashStringWithSalt(input.newPassword, env.AUTH_SECRET);

    // Set initial password
    const updatedUser = await prisma.user.update({
      where: {
        id: ctx.user.id,
      },
      data: {
        passwordHash: newPasswordHash,
      },
      select: {
        id: true,
      },
    });

    return updatedUser;
  });

export const sendUpdateEmailVerificationCodeAction = authAction.action(
  async ({ ctx }) => {
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: {
          startsWith: `${ctx.user.email}-update-profile`,
        },
      },
    });

    const verificationToken = await prisma.verificationToken.create({
      data: {
        identifier: `${ctx.user.email}-update-profile`,
        expires: addHours(new Date(), 1),
        token: nanoid(6),
      },
    });

    await sendEmail({
      to: ctx.user.email,
      subject: "[Action required] Update your profile",
      react: MarkdownEmail({
        markdown: `Hi,
        
You have requested to update your profile email.

Here is your verification code: ${verificationToken.token}

⚠️ If you didn't request this, please ignore this email.

Best,`,
        preview: "Request to update your profile email",
      }),
    });

    return {
      send: true,
    };
  },
);

export const verifyUpdateEmailTokenAction = authAction
  .schema(
    z.object({
      token: z.string(),
    }),
  )
  .action(async ({ parsedInput: { token }, ctx }) => {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        token,
      },
    });

    if (!verificationToken) {
      throw new ActionError("Invalid token");
    }

    if (verificationToken.identifier !== `${ctx.user.email}-update-profile`) {
      throw new ActionError("Invalid token");
    }

    if (verificationToken.expires < new Date()) {
      throw new ActionError("Token expired");
    }

    return {
      valid: true,
    };
  });
