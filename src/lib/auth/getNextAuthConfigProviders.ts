import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import Twitter from "next-auth/providers/twitter";
import { cache } from 'react';

import { SiteConfig } from "@/config/site-config-full";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { sendEmail } from "@/lib/mail/sendEmail";
import { getCredentialsProvider } from "@/lib/auth/credentials-provider";
import { MagicLinkMail } from "@/emails/templates/VerificationEmails/MagicLinkMail";

interface TwitterProfileData {
  id: string;
  name: string;
  email?: string;
  profile_image_url?: string;
}

interface TwitterProfile {
  data: TwitterProfileData;
}

type Providers = NonNullable<NextAuthConfig["providers"]>;

export const getNextAuthConfigProviders = cache((): Providers => {
  // Debug logging
  logger.info('[Auth] Checking environment variables', {
    hasResendApiKey: !!env.RESEND_API_KEY,
    hasResendEmailFrom: !!env.RESEND_EMAIL_FROM,
    hasNextAuthSecret: !!env.NEXTAUTH_SECRET,
    hasNextAuthUrl: !!env.NEXTAUTH_URL,
  });

  const providers: Providers = [
    Resend({
      apiKey: env.RESEND_API_KEY,
      sendVerificationRequest: async ({ identifier: email, url }) => {
        try {
          const result = await sendEmail({
            to: email,
            subject: `Sign in to ${SiteConfig.appName}`,
            react: MagicLinkMail({
              url,
            }),
          });

          if (result.error) {
            logger.error("[Auth] Magic Link Error", { 
              error: result.error,
              email,
              url
            });
            throw new Error(`Failed to send magic link: ${result.error}`);
          }

          logger.info("[Auth] Magic link sent", { email });
        } catch (error) {
          logger.error("[Auth] Magic link failed", { 
            error,
            email,
            url
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
        async profile(profile: TwitterProfile) {
          logger.info("[Auth] Twitter profile data", { profile });
          
          // Handle case where email might not be available
          const email = profile.data.email || `${profile.data.id}@twitter.placeholder.com`;
          
          return {
            id: profile.data.id,
            name: profile.data.name,
            email: email,
            image: profile.data.profile_image_url,
          };
        },
      }), // Removed any type assertion
    );
  }

  if (env.GOOGLE_ID && env.GOOGLE_SECRET) {
    providers.push(
      Google({
        clientId: env.GOOGLE_ID,
        clientSecret: env.GOOGLE_SECRET,
        authorization: {
          params: {
            prompt: "consent",
            access_type: "offline",
            response_type: "code",
            scope: "openid email profile"
          }
        },
        async profile(profile, tokens) {
          return {
            id: profile.sub,
            email: profile.email,
            name: profile.name,
            image: profile.picture,
            emailVerified: profile.email_verified ? new Date() : null,
          };
        },
      }),
    );
  }

  if (SiteConfig.features.enablePasswordAuth) {
    providers.push(getCredentialsProvider());
  }

  return providers;
});
