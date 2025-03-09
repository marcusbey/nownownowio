import MagicLinkMail from "@/emails/magic-link-email.email";
import { SiteConfig } from "@/site-config";
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import Twitter from "next-auth/providers/twitter";
import { cache } from "react";
import { env } from "../env";
import { logger } from "../logger";
import { sendEmail } from "../mail/sendEmail";
import { getCredentialsProvider } from "./credentials-provider";

type Providers = NonNullable<NextAuthConfig["providers"]>;

export const getNextAuthConfigProviders = cache((): Providers => {
  // Debug logging
  logger.info('[Auth] Checking environment variables', {
    hasResendApiKey: !!env.RESEND_API_KEY,
    hasResendEmailFrom: !!env.RESEND_EMAIL_FROM,
    hasNextAuthSecret: !!env.AUTH_SECRET,
    hasNextAuthUrl: !!env.NEXT_PUBLIC_BASE_URL,
  });

  const providers: Providers = [
    Resend({
      apiKey: env.RESEND_API_KEY,
      sendVerificationRequest: async ({ identifier: email, url }) => {
        try {
          const result = await sendEmail({
            to: email,
            subject: `Sign in to ${SiteConfig.domain}`,
            react: MagicLinkMail({
              url,
            }),
          });

          if (result.error) {
            logger.error("[Auth] Resend Provider Error", {
              error: result.error,
              email
            });
            throw new Error(`Failed to send email: ${result.error}`);
          }

          logger.info("[Auth] Magic link email sent successfully", { email });
        } catch (error) {
          logger.error("[Auth] Failed to send magic link email", {
            error,
            email
          });
          throw error;
        }
      },
    }),
  ];

  if (env.TWITTER_ID && env.TWITTER_SECRET) {
    providers.push(
      Twitter({
        clientId: env.TWITTER_ID,
        clientSecret: env.TWITTER_SECRET,
        authorization: {
          url: "https://twitter.com/i/oauth2/authorize",
          params: {
            scope: "users.read tweet.read offline.access",
          }
        },
        userinfo: {
          url: 'https://api.twitter.com/2/users/me',
          params: { 'user.fields': 'name,profile_image_url,email' }
        },
        async profile(profile: { data: { id: string; name: string; email?: string; profile_image_url?: string } }) {
          logger.info("[Auth] Twitter profile data", { profile });

          // Handle case where email might not be available
          const email = profile.data.email ?? `${profile.data.id}@twitter.placeholder.com`;

          return {
            id: profile.data.id,
            name: profile.data.name,
            email: email,
            image: profile.data.profile_image_url,
            emailVerified: new Date(), // Set emailVerified to current date for OAuth providers
          };
        },
      }),
    );
  }

  // Use environment-provided URL or fallback to development URL
  const baseUrl = env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  // Log the URL being used for debugging
  logger.info('[Auth] Using base URL for auth providers', { baseUrl });

  if (env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET) {
    providers.push(
      Google({
        clientId: env.AUTH_GOOGLE_ID,
        clientSecret: env.AUTH_GOOGLE_SECRET,
        profile(profile: { sub: string; name: string; email: string; picture?: string }) {
          return {
            id: profile.sub,
            name: profile.name,
            email: profile.email,
            image: profile.picture,
            emailVerified: new Date(), // Set emailVerified to current date for OAuth providers
          };
        },
        authorization: {
          params: {
            prompt: "consent",
            access_type: "offline",
            response_type: "code",
            scope: "openid email profile",
            redirect_uri: `${baseUrl}/api/v1/auth/callback/google`
          }
        }
      }),
    );
  }

  if (SiteConfig.features.enablePasswordAuth) {
    providers.push(getCredentialsProvider());
  }

  return providers;
});

