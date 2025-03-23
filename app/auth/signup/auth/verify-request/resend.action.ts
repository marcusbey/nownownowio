"use server";

import { ActionError, action } from "@/lib/actions/safe-actions";
import { getResendInstance } from "@/lib/mail/resend";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { z } from "zod";

const ResendEmailSchema = z.object({
  input: z.object({
    email: z.string().email(),
  }),
});

export const resendVerificationEmail = action
  .schema(ResendEmailSchema)
  .action(async ({ parsedInput: { input: { email } } }) => {
    try {
      logger.info('Starting verification email resend process', { email });

      // Log environment variables (without sensitive values)
      logger.info('Checking environment configuration', {
        hasApiKey: !!env.RESEND_API_KEY,
        emailFrom: env.RESEND_EMAIL_FROM,
        baseUrl: env.NEXT_PUBLIC_BASE_URL
      });

      // Find the user with robust connection handling
      logger.info('Looking up user in database', { email });
      let user;
      
      const MAX_DB_RETRIES = 3;
      const DB_RETRY_DELAY = 2000; // 2 seconds
      
      for (let attempt = 1; attempt <= MAX_DB_RETRIES; attempt++) {
        try {
          // Verify database connection first
          await prisma.$queryRaw`SELECT 1`;
          
          user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              emailVerified: true,
            }
          });
          
          // If we get here, query was successful
          break;
        } catch (error) {
          logger.warn(`Database query attempt ${attempt}/${MAX_DB_RETRIES} failed`, { 
            error,
            email,
            attempt 
          });
          
          if (attempt === MAX_DB_RETRIES) {
            logger.error('All database retry attempts failed', { error, email });
            throw new ActionError('Database connection issues. Please try again in a few moments.');
          }
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, DB_RETRY_DELAY));
        }
      }
      
      logger.info('User lookup result', { 
        userFound: !!user,
        emailVerified: user?.emailVerified,
      });

      if (!user) {
        // Check if there's a pending signup (user exists but verification token expired)
        try {
          const existingToken = await prisma.verificationToken.findFirst({
            where: { 
              identifier: email,
              expires: { gt: new Date() } // Add expiration check
            }
          });

          if (existingToken) {
            logger.info('Found orphaned token without user', { email });
            await prisma.verificationToken.delete({ where: { token: existingToken.token } });
            throw new ActionError("Signup incomplete - please register again");
          }
        } catch (error) {
          logger.error('Error checking verification token', { error, email });
        }
        
        // If we reach here, either there was no token or there was an error checking
        throw new ActionError("No account found. Please sign up first");
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
      logger.info('Creating new verification token', { email, userId: user.id });
      
      // Generate new verification token
      const token = await prisma.verificationToken.create({
        data: {
          identifier: email,
          token: `${Math.random().toString(36).substring(2)}${Date.now()}`,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          data: { 
            stage: 'resend_verification'
          },
          user: {
            connect: {
              id: user.id
            }
          }
        },
      }).catch(error => {
        logger.error('Failed to create verification token', { error, email });
        throw new ActionError('Failed to create verification token');
      });
      
      logger.info('Successfully created verification token', { 
        email,
        tokenId: token.token,
        expires: token.expires 
      });

      // Send verification email
      const resendClient = await getResendInstance();
      const verifyUrl = `${env.NEXT_PUBLIC_BASE_URL}/auth/verify?token=${token.token}`;

      logger.info('Sending verification email', { email, verifyUrl });

      // Verify environment variables
      if (!env.RESEND_API_KEY) {
        logger.error('RESEND_API_KEY is not configured');
        throw new ActionError('Email service is not properly configured');
      }

      if (!env.RESEND_EMAIL_FROM) {
        logger.error('RESEND_EMAIL_FROM is not configured');
        throw new ActionError('Sender email is not configured');
      }

      logger.info('Attempting to send email with Resend', {
        from: env.RESEND_EMAIL_FROM,
        to: email,
      });

      // Send email with HTML instead of React component for testing
      logger.info('Preparing to send email', {
        from: env.RESEND_EMAIL_FROM,
        to: email,
        verifyUrl
      });

      try {
        logger.info('Attempting to send email via Resend');
        const emailResult = await resendClient.emails.send({
        from: env.RESEND_EMAIL_FROM,
        to: email,
        subject: 'Verify your email address',
        html: `
          <div>
            <h1>Verify your email address</h1>
            <p>Click the link below to verify your email:</p>
            <p><a href="${verifyUrl}">Click here to verify your email</a></p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `,
      });

      logger.info('Verification email resent successfully', {
        emailId: emailResult?.id,
        to: email,
      });
      } catch (error) {
        logger.error('Failed to send email via Resend', { error });
        throw new ActionError('Failed to send verification email. Please try again later.');
      }

      return { success: true };
    } catch (error) {
      logger.error('Failed to resend verification email', { error, email });
      if (error instanceof ActionError) {
        throw error;
      }
      throw new ActionError('Failed to resend verification email');
    }
  });
