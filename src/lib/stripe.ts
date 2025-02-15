import Stripe from "stripe";
import { env } from "./env";
import { logger } from "./logger";

const isProduction = process.env.NODE_ENV === "production";

function getStripeKey(): string {
  const key = isProduction ? env.STRIPE_SECRET_KEY : env.STRIPE_SECRET_KEY_TEST;
  
  if (!key) {
    const envVar = isProduction ? "STRIPE_SECRET_KEY" : "STRIPE_SECRET_KEY_TEST";
    const error = `Missing ${envVar} environment variable`;
    logger.error(error);
    throw new Error(error);
  }
  
  return key;
}

export const stripe = new Stripe(getStripeKey(), {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
  telemetry: false, // Disable Stripe telemetry in development
});
