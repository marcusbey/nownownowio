"use server";

import { env } from "@/lib/env";
import Stripe from "stripe";
import { logger } from "./logger";

export async function getStripeInstance(): Promise<Stripe> {
  const stripeKey =
    env.NODE_ENV === "production"
      ? env.STRIPE_SECRET_KEY
      : env.STRIPE_SECRET_KEY_TEST;

  if (!stripeKey) {
    const message = `Missing Stripe secret key for ${env.NODE_ENV} environment`;
    logger.error(message);
    throw new Error(message);
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: "2024-12-18.acacia",
    typescript: true,
    telemetry: false,
  });
  return Promise.resolve(stripe);
}

let _stripe: Stripe | null = null;

export async function getStripe(): Promise<Stripe> {
  if (!_stripe) {
    _stripe = await getStripeInstance();
  }
  return _stripe;
}

// Server-only actions
export async function createCustomer(params: Stripe.CustomerCreateParams) {
  const stripe = await getStripe();
  return stripe.customers.create(params);
}

export async function updateCustomer(id: string, params: Stripe.CustomerUpdateParams) {
  const stripe = await getStripe();
  return stripe.customers.update(id, params);
}

export async function getCustomer(customerId: string) {
  const stripe = await getStripe();
  return stripe.customers.retrieve(customerId);
}

export async function deleteCustomer(customerId: string) {
  const stripe = await getStripe();
  return stripe.customers.del(customerId);
}

export async function createCheckoutSession(params: Stripe.Checkout.SessionCreateParams) {
  const stripe = await getStripe();
  return stripe.checkout.sessions.create(params);
}

export async function retrievePrice(priceId: string) {
  const stripe = await getStripe();
  return stripe.prices.retrieve(priceId);
}

export async function constructWebhookEvent(payload: string, signature: string, webhookSecret: string) {
  const secret = env.NODE_ENV === "production"
    ? env.STRIPE_WEBHOOK_SECRET_LIVE
    : env.STRIPE_WEBHOOK_SECRET_TEST;

  const stripe = await getStripe();
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret || secret);
}
