import Stripe from "stripe";
import { env } from "./env";
import { logger } from "./logger";

const isProduction = process.env.NODE_ENV === "production";

function getStripeKey(): string {
  if (process.env.NODE_ENV === 'development') {
    return env.STRIPE_SECRET_KEY_TEST;
  }
  return env.STRIPE_SECRET_KEY ?? '';
}

export const stripe = new Stripe(getStripeKey(), {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
  telemetry: false, // Disable Stripe telemetry in development
});
