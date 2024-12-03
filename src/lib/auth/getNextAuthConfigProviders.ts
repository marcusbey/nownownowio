import MagicLinkMail from "@/email/MagicLinkEmail.email";
import { SiteConfig } from "@/site-config";
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import Twitter from "next-auth/providers/twitter";
import { env } from "../env";
import { logger } from "../logger";
import { sendEmail } from "../mail/sendEmail";
import { getCredentialsProvider } from "./credentials-provider";
import { cache } from 'react';

type Providers = NonNullable<NextAuthConfig["providers"]>;

export const getNextAuthConfigProviders = cache((): Providers => {
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
          params: {
            scope: "users.read tweet.read offline.access",
          }
        },
        async profile(profile, tokens) {
          return {
            id: profile.id_str,
            email: profile.email,
            name: profile.name,
            image: profile.profile_image_url_https,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_at: Math.floor(Date.now() / 1000 + (tokens.expires_in || 3600)),
          };
        },
      }),
    );
  }

  if (env.GOOGLE_ID && env.GOOGLE_SECRET) {
    providers.push(
      Google({
        clientId: env.GOOGLE_ID,
        clientSecret: env.GOOGLE_SECRET,
        authorization: {
          params: {
            access_type: "offline", // Enable refresh token
            prompt: "consent",      // Force consent screen
            scope: "openid email profile"
          }
        },
        async profile(profile, tokens) {
          return {
            id: profile.sub,
            email: profile.email,
            name: profile.name,
            image: profile.picture,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_at: Math.floor(Date.now() / 1000 + (tokens.expires_in || 3600)),
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
