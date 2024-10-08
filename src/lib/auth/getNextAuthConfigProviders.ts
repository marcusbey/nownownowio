import MagicLinkMail from "@/email/MagicLinkEmail.email";
import { SiteConfig } from "@/site-config";
import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import Twitter from "next-auth/providers/twitter";
import { env } from "../env";
import { logger } from "../logger";
import { sendEmail } from "../mail/sendEmail";
import { getCredentialsProvider } from "./credentials-provider";

type Providers = NonNullable<NextAuthConfig["providers"]>;

export const getNextAuthConfigProviders = (): Providers => {
  const providers: Providers = [
    Resend({
      apiKey: env.RESEND_API_KEY,
      sendVerificationRequest: async ({ identifier: email, url }) => {
        const result = await sendEmail({
          to: email,
          subject: `Sign in to ${SiteConfig.domain}`,
          react: MagicLinkMail({
            url,
          }),
        });

        if (result.error) {
          logger.error("Auth Resend Provider Error", result.error);
          throw new Error(`Failed to send email: ${result.error}`);
        }
      },
    }),
  ];

  if (env.GITHUB_ID && env.GITHUB_SECRET) {
    providers.push(
      GitHub({
        clientId: env.GITHUB_ID,
        clientSecret: env.GITHUB_SECRET,
      }),
    );
  }

  if (env.TWITTER_ID && env.TWITTER_SECRET) {
    providers.push(
      Twitter({
        clientId: env.TWITTER_ID,
        clientSecret: env.TWITTER_SECRET,
      }),
    );
  }

  if (env.GOOGLE_ID && env.GOOGLE_SECRET) {
    providers.push(
      Google({
        clientId: env.GOOGLE_ID,
        clientSecret: env.GOOGLE_SECRET,
      }),
    );
  }

  if (SiteConfig.features.enablePasswordAuth) {
    providers.push(getCredentialsProvider());
  }

  return providers;
};
