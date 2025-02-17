"use server";

import { stripe } from "@/lib/stripe";
import { logger } from "@/lib/logger";

export async function getStripeSession(sessionId: string) {
  try {
    return await stripe.checkout.sessions.retrieve(sessionId);
  } catch (error) {
    logger.error("Error retrieving Stripe session:", error);
    throw error;
  }
}

export async function createStripeSession(params: Parameters<typeof stripe.checkout.sessions.create>[0]) {
  try {
    return await stripe.checkout.sessions.create(params);
  } catch (error) {
    logger.error("Error creating Stripe session:", error);
    throw error;
  }
}
