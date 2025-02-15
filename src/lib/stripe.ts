import Stripe from "stripe";
import { env } from "./env";
import { logger } from "./logger";

const isProduction = process.env.NODE_ENV === "production";

const stripeKey = process.env.NODE_ENV === 'development'
  ? env.STRIPE_SECRET_KEY_TEST
  : env.STRIPE_SECRET_KEY;

if (!stripeKey) {
  throw new Error(`Missing Stripe secret key for ${process.env.NODE_ENV} environment`);
}

export const stripe = new Stripe(stripeKey, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
  telemetry: false, // Disable Stripe telemetry in development
});
