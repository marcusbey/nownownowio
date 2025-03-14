"use server";

import type Stripe from "stripe";
import { getStripeInstance } from "@/lib/stripe";
import { logger } from "@/lib/logger";

export async function getStripeSession(sessionId: string) {
  try {
    const stripe = await getStripeInstance();
    return await stripe.checkout.sessions.retrieve(sessionId);
  } catch (error) {
    logger.error("Error retrieving Stripe session:", error);
    throw error;
  }
}

export async function createStripeSession(params: Stripe.Checkout.SessionCreateParams) {
  try {
    const stripe = await getStripeInstance();
    return await stripe.checkout.sessions.create(params);
  } catch (error) {
    logger.error("Error creating Stripe session:", error);
    throw error;
  }
}
