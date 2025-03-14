"use server";

import { ActionError, action } from "@/lib/actions/safe-actions";
import { getResendInstance } from "@/lib/mail/resend";
import VerifyEmail from "@/emails/verify-email.email";
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
import { Prisma } from "@prisma/client";
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
          identifier: email,
          token: crypto.randomUUID(),
          expires: new Date(Date.now() + 900_000), // 15 minutes
          data: { 
            signupStage: 'user_created'
          },
          user: {
            connect: {
              id: user.id
            }
          }
        }
      });
      
      // Handle email sending errors gracefully without deleting the user
      process.on('uncaughtException', async (error) => {
        logger.error('Uncaught exception during signup', { 
          error, 
          userId: user.id,
          email 
        });
      });
      
      // Send verification email using Resend
      try {
        const resendClient = await getResendInstance();
        
        // Validate environment variables
        if (!env.RESEND_API_KEY || !env.RESEND_EMAIL_FROM || !env.NEXTAUTH_URL) {
          logger.error('Missing required environment variables for email sending', {
            hasApiKey: !!env.RESEND_API_KEY,
            hasEmailFrom: !!env.RESEND_EMAIL_FROM,
            hasNextAuthUrl: !!env.NEXTAUTH_URL
          });
          throw new Error('Email configuration is incomplete');
        }
        
        // Log email attempt
        logger.info('Attempting to send verification email', { 
          to: user.email,
          from: env.RESEND_EMAIL_FROM,
          nextAuthUrl: env.NEXTAUTH_URL
        });

        // Use proper email template
        const verifyUrl = `${env.NEXTAUTH_URL}/auth/verify?token=${token.token}`;
        
        const emailResult = await resendClient.emails.send({
          from: `NowNowNow <${env.RESEND_EMAIL_FROM}>`,
          to: user.email,
          subject: 'Welcome to NowNowNow - Verify Your Email',
          react: VerifyEmail({ url: verifyUrl }),
          text: `Welcome to NowNowNow! Please verify your email address by clicking this link: ${verifyUrl} (expires in 15 minutes)`,
          headers: {
            'List-Unsubscribe': `<${env.NEXTAUTH_URL}/auth/unsubscribe?email=${encodeURIComponent(user.email)}>`,
            'X-Entity-Ref-ID': user.id
          }
        }).catch(error => {
          logger.error('Failed to send verification email', { error, email: user.email });
          throw new ActionError('Failed to send verification email. Please try again or contact support.');
        });
        
        if (!emailResult?.id) {
          logger.error('No email ID returned from Resend', { email: user.email });
          throw new ActionError('Failed to send verification email. Please try again or contact support.');
        }
        
        logger.info('Verification email sent successfully', { 
          emailId: emailResult.id,
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
        throw new ActionError('Failed to send verification email. Please try again or contact support.');
      }

      // Handle any pending invitations and get the user's primary organization
      await setupDefaultOrganizationsOrInviteUser(user);

      // Redirect to verification pending page with email
      redirect(`/auth/verify-request?email=${encodeURIComponent(email)}`, { scroll: false });

      return user;
    } catch (error) {
      logger.error("Failed to sign up user", { error, email });
      if (error instanceof Error) {
        throw new ActionError(error.message);
      }
      throw new ActionError("Failed to create account");
    }
  });
