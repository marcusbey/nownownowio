import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * This is the schema for the environment variables.
 *
 * Please import **this** file and use the `env` variable
 */
export const env = createEnv({
  server: {
    DATABASE_URL: z.string(),
    AUTH_GOOGLE_ID: z.string().optional(),
    AUTH_GOOGLE_SECRET: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
    RESEND_AUDIENCE_ID: z.string().optional(),
    RESEND_EMAIL_FROM: z.string().optional(),
    STRIPE_SECRET_KEY: z.string(),
    STRIPE_SECRET_KEY_TEST: z.string(),
    STRIPE_WEBHOOK_SECRET_LIVE: z.string(),
    STRIPE_WEBHOOK_SECRET_TEST: z.string(),
    AUTH_SECRET: z.string().optional(),
    NODE_ENV: z.enum(["development", "production", "test"]).optional(),
    API_KEY_SECRET: z.string().optional(),
    WIDGET_SECRET_KEY: z.string().optional(),
    TWITTER_ID: z.string().optional(),
    TWITTER_SECRET: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_BASE_URL: z.string(),
    NEXT_PUBLIC_EMAIL_CONTACT: z.string(),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string(),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST: z.string(),
    NEXT_PUBLIC_API_URL: z.string(),
    NEXT_PUBLIC_WIDGET_URL: z.string(),
    NEXT_PUBLIC_STRIPE_FREEBIRD_MONTHLY_PRICE_ID: z.string(),
    NEXT_PUBLIC_STRIPE_FREEBIRD_YEARLY_PRICE_ID: z.string(),
    NEXT_PUBLIC_STRIPE_FREEBIRD_LIFETIME_PRICE_ID: z.string(),
    NEXT_PUBLIC_STRIPE_FREE_PRICE_ID: z.string(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_EMAIL_CONTACT: process.env.NEXT_PUBLIC_EMAIL_CONTACT,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_WIDGET_URL: process.env.NEXT_PUBLIC_WIDGET_URL,
    NEXT_PUBLIC_STRIPE_FREEBIRD_MONTHLY_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_FREEBIRD_MONTHLY_PRICE_ID,
    NEXT_PUBLIC_STRIPE_FREEBIRD_YEARLY_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_FREEBIRD_YEARLY_PRICE_ID,
    NEXT_PUBLIC_STRIPE_FREEBIRD_LIFETIME_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_FREEBIRD_LIFETIME_PRICE_ID,
    NEXT_PUBLIC_STRIPE_FREE_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_FREE_PRICE_ID,
  },
  skipValidation: process.env.NODE_ENV === 'development',
  emptyStringAsUndefined: true,
});
