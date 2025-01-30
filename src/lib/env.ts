import { z } from 'zod'

const serverSchema = z.object({
  // NextAuth
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),
  
  // Auth Providers
  GOOGLE_ID: z.string().min(1),
  GOOGLE_SECRET: z.string().min(1),
  TWITTER_ID: z.string().min(1),
  TWITTER_SECRET: z.string().min(1),
  
  // Resend
  RESEND_API_KEY: z.string().min(1),
  RESEND_AUDIENCE_ID: z.string().min(1),
  RESEND_EMAIL_FROM: z.string().email(),
  RESEND_WEBHOOK: z.string().url(),
  
  // Database
  DATABASE_URL: z.string().min(1),
  
  // Stripe Server
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET_LIVE: z.string().min(1),
  STRIPE_SECRET_KEY_TEST: z.string().min(1),
  STRIPE_WEBHOOK_SECRET_TEST: z.string().min(1),
  
  // Widget
  API_KEY_SECRET: z.string().min(1),
  WIDGET_SECRET_KEY: z.string().min(1),
  
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const clientSchema = z.object({
  // Public URLs and Keys
  NEXT_PUBLIC_BASE_URL: z.string().url(),
  NEXT_PUBLIC_EMAIL_CONTACT: z.string().email(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST: z.string().min(1),
  NEXT_PUBLIC_WIDGET_URL: z.string().url(),
  NEXT_PUBLIC_API_URL: z.string().url(),
  
  // Stripe Price IDs
  NEXT_PUBLIC_STRIPE_FREEBIRD_MONTHLY_PRICE_ID: z.string().min(1),
  NEXT_PUBLIC_STRIPE_FREEBIRD_YEARLY_PRICE_ID: z.string().min(1),
  NEXT_PUBLIC_STRIPE_FREEBIRD_LIFETIME_PRICE_ID: z.string().min(1),
  NEXT_PUBLIC_STRIPE_FREE_PRICE_ID: z.string().min(1),
});

/**
 * @internal
 */
const processEnv = {
  // NextAuth
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  NEXT_PUBLIC_EMAIL_CONTACT: process.env.NEXT_PUBLIC_EMAIL_CONTACT,

  // Auth Providers
  GOOGLE_ID: process.env.GOOGLE_ID,
  GOOGLE_SECRET: process.env.GOOGLE_SECRET,
  TWITTER_ID: process.env.TWITTER_ID,
  TWITTER_SECRET: process.env.TWITTER_SECRET,

  // Resend
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_AUDIENCE_ID: process.env.RESEND_AUDIENCE_ID,
  RESEND_EMAIL_FROM: process.env.RESEND_EMAIL_FROM,
  RESEND_WEBHOOK: process.env.RESEND_WEBHOOK,

  // Database
  DATABASE_URL: process.env.DATABASE_URL,

  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  STRIPE_WEBHOOK_SECRET_LIVE: process.env.STRIPE_WEBHOOK_SECRET_LIVE,
  STRIPE_SECRET_KEY_TEST: process.env.STRIPE_SECRET_KEY_TEST,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST,
  STRIPE_WEBHOOK_SECRET_TEST: process.env.STRIPE_WEBHOOK_SECRET_TEST,

  // Stripe Price IDs
  NEXT_PUBLIC_STRIPE_FREEBIRD_MONTHLY_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_FREEBIRD_MONTHLY_PRICE_ID,
  NEXT_PUBLIC_STRIPE_FREEBIRD_YEARLY_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_FREEBIRD_YEARLY_PRICE_ID,
  NEXT_PUBLIC_STRIPE_FREEBIRD_LIFETIME_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_FREEBIRD_LIFETIME_PRICE_ID,
  NEXT_PUBLIC_STRIPE_FREE_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_FREE_PRICE_ID,

  // Widget
  API_KEY_SECRET: process.env.API_KEY_SECRET,
  WIDGET_SECRET_KEY: process.env.WIDGET_SECRET_KEY,
  NEXT_PUBLIC_WIDGET_URL: process.env.NEXT_PUBLIC_WIDGET_URL,

  // API
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,

  // Node Environment
  NODE_ENV: process.env.NODE_ENV,
} as const;

const isServer = typeof window === 'undefined';

const merged = isServer
  ? { ...processEnv }
  : { ...processEnv, NODE_ENV: process.env.NODE_ENV };

let env = {} as any;

if (isServer) {
  const serverParsed = serverSchema.safeParse(merged);
  if (!serverParsed.success) {
    console.error(
      '❌ Invalid environment variables:',
      JSON.stringify(serverParsed.error.format(), null, 4),
    );
    throw new Error('Invalid environment variables');
  }
  env = { ...serverParsed.data };
}

const clientParsed = clientSchema.safeParse(merged);
if (!clientParsed.success) {
  console.error(
    '❌ Invalid public environment variables:',
    JSON.stringify(clientParsed.error.format(), null, 4),
  );
  throw new Error('Invalid public environment variables');
}

env = {
  ...env,
  ...clientParsed.data,
};

export { env };
