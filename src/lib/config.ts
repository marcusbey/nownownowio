export const config = {
  nodeEnv: process.env.NODE_ENV,
  database: {
    url: process.env.DATABASE_URL,
  },
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    priceIds: {
      free: process.env.NEXT_PUBLIC_STRIPE_FREE_PRICE_ID,
      proMonthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
      proLifetime: process.env.NEXT_PUBLIC_STRIPE_PRO_LIFETIME_PRICE_ID,
    },
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL,
  },
} as const;
