"use server";

import { env } from "@/lib/env";
import Stripe from "stripe";
import { logger } from "./logger";

const getStripeClient = () => {
  const stripeKey =
    env.NODE_ENV === "production"
      ? env.STRIPE_SECRET_KEY
      : env.STRIPE_SECRET_KEY_TEST;

  if (!stripeKey) {
    const message = `Missing Stripe secret key for ${env.NODE_ENV} environment`;
    logger.error(message);
    throw new Error(message);
  }

  return new Stripe(stripeKey, {
    apiVersion: "2023-10-16",
    typescript: true,
    telemetry: false,
  });
};

// Server-only actions
export async function createCustomer(params: Stripe.CustomerCreateParams) {
  return await getStripeClient().customers.create(params);
}

export async function updateCustomer(id: string, params: Stripe.CustomerUpdateParams) {
  return await getStripeClient().customers.update(id, params);
}

export async function getCustomer(customerId: string) {
  return await getStripeClient().customers.retrieve(customerId);
}

export async function deleteCustomer(customerId: string) {
  return await getStripeClient().customers.del(customerId);
}

export async function createCheckoutSession(params: Stripe.Checkout.SessionCreateParams) {
  return await getStripeClient().checkout.sessions.create(params);
}

export async function retrievePrice(priceId: string) {
  return await getStripeClient().prices.retrieve(priceId);
}

export async function constructWebhookEvent(payload: string, signature: string, webhookSecret: string) {
  const secret = env.NODE_ENV === "production" 
    ? env.STRIPE_WEBHOOK_SECRET_LIVE 
    : env.STRIPE_WEBHOOK_SECRET_TEST;

  return getStripeClient().webhooks.constructEvent(payload, signature, webhookSecret || secret);
}
