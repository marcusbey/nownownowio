"use server";

import { ActionError, action } from "@/lib/actions/safe-actions";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { z } from "zod";

const VerifyEmailSchema = z.object({
  token: z.string(),
});

export const verifyEmail = action
  .schema(VerifyEmailSchema)
  .action(async ({ parsedInput: { token } }) => {
    try {
      logger.info("Verifying email token", { token });

      const verificationToken = await prisma.verificationToken.findUnique({
        where: { token },
      });

      if (!verificationToken) {
        logger.error("Invalid verification token", { token });
        throw new ActionError("Invalid verification token");
      }

      if (verificationToken.expires < new Date()) {
        logger.error("Verification token expired", { token });
        throw new ActionError("Verification token has expired");
      }

      // Update user email verification status
      await prisma.user.update({
        where: { email: verificationToken.identifier },
        data: { emailVerified: new Date() },
      });

      // Delete the used token
      await prisma.verificationToken.delete({
        where: { token },
      });

      logger.info("Email verified successfully", {
        email: verificationToken.identifier,
      });

      return { success: true };
    } catch (error) {
      logger.error("Failed to verify email", { error });
      if (error instanceof ActionError) {
        throw error;
      }
      throw new ActionError("Failed to verify email");
    }
  });
