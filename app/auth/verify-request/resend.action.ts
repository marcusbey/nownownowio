"use server";

import { ActionError, action } from "@/lib/actions/safe-actions";
import { getResendInstance } from "@/lib/mail/resend";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { z } from "zod";

const ResendEmailSchema = z.object({
  email: z.string().email(),
});

export const resendVerificationEmail = action
  .schema(ResendEmailSchema)
  .action(async ({ parsedInput: { email } }) => {
    try {
      logger.info('Attempting to resend verification email', { email });

      // Find the user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        logger.error('User not found for resend verification', { email });
        throw new ActionError("User not found. Please try signing up again.");
      }

      if (user.emailVerified) {
        logger.info('Email already verified', { email });
        throw new ActionError("This email is already verified. Please try logging in.");
      }

      // Delete any existing tokens
      await prisma.verificationToken.deleteMany({
        where: { identifier: email },
      });

      // Generate new verification token
      const token = await prisma.verificationToken.create({
        data: {
          identifier: email,
          token: `${Math.random().toString(36).substring(2)}${Date.now()}`,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      });

      logger.info('Generated new verification token', { email, tokenId: token.token });

      // Send verification email
      const resendClient = await getResendInstance();
      const VerifyEmail = (await import('@/emails/VerifyEmail.email')).default;
      const verifyUrl = `${env.NEXTAUTH_URL}/auth/verify?token=${token.token}`;

      logger.info('Sending verification email', { email, verifyUrl });

      const emailResult = await resendClient.emails.send({
        from: env.RESEND_EMAIL_FROM,
        to: email,
        subject: 'Verify your email address',
        react: VerifyEmail({ url: verifyUrl }),
      });

      logger.info('Verification email resent successfully', {
        emailId: emailResult,
        to: email,
      });

      return { success: true };
    } catch (error) {
      logger.error('Failed to resend verification email', { error, email });
      if (error instanceof ActionError) {
        throw error;
      }
      throw new ActionError('Failed to resend verification email');
    }
  });
