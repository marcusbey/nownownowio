export const envConfig = {
  nodeEnv: process.env.NODE_ENV,
  database: {
    url: process.env.DATABASE_URL,
  },
  stripe: {
    publishableKey: process.env.NODE_ENV !== 'production'
      ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST
      : process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    priceIds: {
      proMonthly: "price_1QjQJS00GvYcfU0MA4GzNyp6",
      proYearly: "price_1Qji9P00GvYcfU0MR1g0gItW",
      proLifetime: "price_1QjQJb00GvYcfU0MoBCU9kiy",
    },
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL,
  },
} as const;

export type EnvConfig = typeof envConfig;
