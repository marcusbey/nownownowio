import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * This is the schema for the environment variables.
 *
 * Please import **this** file and use the `env` variable
 */
export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    NEXTAUTH_URL: z.string().url(),
    GITHUB_ID: z.string().optional(),
    GITHUB_SECRET: z.string().optional(),
    TWITTER_ID: z.string().optional(),
    TWITTER_SECRET: z.string().optional(),
    GOOGLE_ID: z.string().optional(),
    GOOGLE_SECRET: z.string().optional(),
    RESEND_API_KEY: z.string().min(1),
    RESEND_AUDIENCE_ID: z.string().optional(),
    RESEND_EMAIL_FROM: z.string().min(1),
    STRIPE_SECRET_KEY: z.string().min(1),
    NODE_ENV: z.enum(["development", "production", "test"]),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    NEXTAUTH_SECRET: z.string().min(1),
    API_KEY_SECRET: z.string().min(1),
    WIDGET_SECRET_KEY: z.string().min(1),
  },
  /**
   * If you add `client` environment variables, you need to add them to
   * `experimental__runtimeEnv` as well.
   */
  client: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
    NEXT_PUBLIC_EMAIL_CONTACT: z.string().min(1),
    NEXT_PUBLIC_BASE_URL: z.string().url(),
    NEXT_PUBLIC_SERVER_URL: z.string().url().optional(),
    NEXT_PUBLIC_WIDGET_URL: z.string().url(),
    NEXT_PUBLIC_API_URL: z.string().url(),
    NEXT_PUBLIC_UPLOADTHING_SECRET: z.string().optional(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_EMAIL_CONTACT: process.env.NEXT_PUBLIC_EMAIL_CONTACT,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL,
    NEXT_PUBLIC_WIDGET_URL: process.env.NEXT_PUBLIC_WIDGET_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_UPLOADTHING_SECRET: process.env.NEXT_PUBLIC_UPLOADTHING_SECRET,
  },
});
