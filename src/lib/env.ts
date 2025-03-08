import { z } from 'zod';

const serverSchema = z.object({
  // NextAuth
  NEXT_PUBLIC_BASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(1),

  // Auth Providers
  AUTH_GOOGLE_ID: z.string().min(1).optional(),
  AUTH_GOOGLE_SECRET: z.string().min(1).optional(),
  AUTH_GITHUB_ID: z.string().min(1).optional(),
  AUTH_GITHUB_SECRET: z.string().min(1).optional(),
  TWITTER_ID: z.string().min(1).optional(),
  TWITTER_SECRET: z.string().min(1).optional(),

  // Resend
  RESEND_API_KEY: z.string().min(1),
  RESEND_AUDIENCE_ID: z.string().min(1),
  RESEND_EMAIL_FROM: z.string().email(),
  RESEND_WEBHOOK: z.string().url(),

  // Database
  DATABASE_URL: z.string().min(1),

  // Stripe Server
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET_LIVE: z.string().min(1).optional(),
  STRIPE_SECRET_KEY_TEST: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET_TEST: z.string().min(1).optional(),

  // UploadThing
  UPLOADTHING_SECRET: z.string().min(1),
  UPLOADTHING_TOKEN: z.string().min(1),

  // Widget
  API_KEY_SECRET: z.string().min(1).optional(),
  WIDGET_SECRET_KEY: z.string().min(1).optional(),

  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const clientSchema = z.object({
  // Public URLs and Keys
  NEXT_PUBLIC_BASE_URL: z.string().url(),
  NEXT_PUBLIC_EMAIL_CONTACT: z.string().email().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST: z.string().min(1).optional(),
  NEXT_PUBLIC_WIDGET_URL: z.string().url().optional(),
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
  
  // UploadThing
  NEXT_PUBLIC_UPLOADTHING_ID: z.string().min(1),
  NEXT_PUBLIC_UPLOADTHING_API_URL: z.string().url(),

  // Stripe Price IDs
  NEXT_PUBLIC_STRIPE_FREE_PRICE_ID: z.string().min(1).optional(),
  NEXT_PUBLIC_STRIPE_BASIC_MONTHLY_PRICE_ID: z.string().min(1).optional(),
  NEXT_PUBLIC_STRIPE_BASIC_ANNUAL_PRICE_ID: z.string().min(1).optional(),
  NEXT_PUBLIC_STRIPE_BASIC_LIFETIME_PRICE_ID: z.string().min(1).optional(),
  NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID: z.string().min(1).optional(),
  NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID: z.string().min(1).optional(),
  NEXT_PUBLIC_STRIPE_PRO_LIFETIME_PRICE_ID: z.string().min(1).optional(),
});

/**
 * @internal
 */
const processEnv = {
  // NextAuth
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  NEXT_PUBLIC_EMAIL_CONTACT: process.env.NEXT_PUBLIC_EMAIL_CONTACT,

  // Auth Providers
  AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
  AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
  AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID,
  AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET,
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
  NEXT_PUBLIC_STRIPE_FREE_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_FREE_PRICE_ID,
  NEXT_PUBLIC_STRIPE_BASIC_MONTHLY_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_BASIC_MONTHLY_PRICE_ID,
  NEXT_PUBLIC_STRIPE_BASIC_ANNUAL_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_BASIC_ANNUAL_PRICE_ID,
  NEXT_PUBLIC_STRIPE_BASIC_LIFETIME_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_BASIC_LIFETIME_PRICE_ID,
  NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
  NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID,
  NEXT_PUBLIC_STRIPE_PRO_LIFETIME_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_PRO_LIFETIME_PRICE_ID,

  // Widget
  API_KEY_SECRET: process.env.API_KEY_SECRET,
  WIDGET_SECRET_KEY: process.env.WIDGET_SECRET_KEY,
  NEXT_PUBLIC_WIDGET_URL: process.env.NEXT_PUBLIC_WIDGET_URL,

  // API
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,

  // UploadThing
  UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET,
  UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
  NEXT_PUBLIC_UPLOADTHING_ID: process.env.NEXT_PUBLIC_UPLOADTHING_ID,
  NEXT_PUBLIC_UPLOADTHING_API_URL: process.env.NEXT_PUBLIC_UPLOADTHING_API_URL,

  // Node Environment
  NODE_ENV: process.env.NODE_ENV,
} as const;

const isServer = typeof window === 'undefined';

const merged = isServer
  ? { ...processEnv }
  : { ...processEnv, NODE_ENV: process.env.NODE_ENV };

// Define a proper type for the env object by merging server and client schemas
type EnvType = z.infer<typeof serverSchema> & z.infer<typeof clientSchema>;

// Initialize with an empty object that will be populated
let env = {} as EnvType;

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
