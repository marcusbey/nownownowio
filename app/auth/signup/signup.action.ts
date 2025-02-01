"use server";

import { ActionError, action } from "@/lib/actions/safe-actions";
import { getResendInstance } from "@/lib/mail/resend";
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
import { logger } from "@/lib/logger";

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
          emailVerified: null, // Mark email as unverified
        },
      });

      // Generate verification token
      const token = await prisma.verificationToken.create({
        data: {
          identifier: user.email,
          token: `${Math.random().toString(36).substring(2)}${Date.now()}`,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      });

      // Send verification email using Resend
      try {
        const resendClient = await getResendInstance();
        
        // Log email attempt
        logger.info('Attempting to send verification email', { 
          to: user.email,
          from: env.RESEND_EMAIL_FROM,
          nextAuthUrl: env.NEXTAUTH_URL
        });

        const emailResult = await resendClient.emails.send({
          from: env.RESEND_EMAIL_FROM,
          to: user.email,
          subject: 'Verify your email address',
          html: `
            <h1>Welcome to NowNowNow!</h1>
            <p>Please verify your email address by clicking the link below:</p>
            <a href="${env.NEXTAUTH_URL}/auth/verify?token=${token.token}">Verify Email</a>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't request this email, please ignore it.</p>
          `,
        });
        
        logger.info('Verification email sent successfully', { 
          userId: user.id, 
          to: user.email,
          from: env.RESEND_EMAIL_FROM
        });
      } catch (emailError) {
        logger.error('Failed to send verification email', { 
          error: emailError,
          userId: user.id,
          to: user.email,
          from: env.RESEND_EMAIL_FROM,
          nextAuthUrl: env.NEXTAUTH_URL
        });
        // Don't throw here - user is created but email failed
        // They can request a new verification email later
      }

      // Handle any pending invitations and get the user's primary organization
      await setupDefaultOrganizationsOrInviteUser(user);

      // Redirect to verification pending page without scroll
      redirect('/auth/verify-request', { scroll: false });

      return user;
    } catch (error) {
      logger.error("Failed to sign up user", { error, email });
      if (error instanceof Error) {
        throw new ActionError(error.message);
      }
      throw new ActionError("Failed to create account");
    }
  });
