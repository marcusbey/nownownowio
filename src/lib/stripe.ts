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

export async function getCustomer(params: Stripe.CustomerCreateParams | string) {
  const stripe = await getStripe();
  
  if (typeof params === 'string') {
    // If params is a string, it's a customer ID to retrieve
    return stripe.customers.retrieve(params);
  } else {
    // If params is an object, it's parameters to create a new customer
    return stripe.customers.create(params);
  }
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

// Plan and subscription management
export async function listAllProducts() {
  const stripe = await getStripe();
  return stripe.products.list({ limit: 100, active: true });
}

export async function listAllPrices() {
  const stripe = await getStripe();
  return stripe.prices.list({ limit: 100, active: true });
}

export async function createSubscription(params: Stripe.SubscriptionCreateParams) {
  const stripe = await getStripe();
  return stripe.subscriptions.create(params);
}

export async function updateSubscription(subscriptionId: string, params: Stripe.SubscriptionUpdateParams) {
  const stripe = await getStripe();
  return stripe.subscriptions.update(subscriptionId, params);
}

export async function cancelSubscription(subscriptionId: string) {
  const stripe = await getStripe();
  return stripe.subscriptions.cancel(subscriptionId);
}

export async function retrieveSubscription(subscriptionId: string) {
  const stripe = await getStripe();
  return stripe.subscriptions.retrieve(subscriptionId);
}

export async function listCustomerSubscriptions(customerId: string) {
  const stripe = await getStripe();
  return stripe.subscriptions.list({ customer: customerId });
}

export async function createBillingPortalSession(params: Stripe.BillingPortal.SessionCreateParams) {
  const stripe = await getStripe();
  return stripe.billingPortal.sessions.create(params);
}

// Helper function to get price ID by plan type and billing cycle
export async function getPriceIdByPlan(planType: string, billingCycle: string): Promise<string> {
  // Handle FREE plan which doesn't have billing cycles
  if (planType === 'FREE') {
    const freeKey = 'NEXT_PUBLIC_STRIPE_FREE_PRICE_ID';
    const freePriceId = env[freeKey as keyof typeof env];
    
    if (!freePriceId) {
      throw new Error(`Price ID not found for FREE plan`);
    }
    
    return freePriceId;
  }
  
  // Handle regular plans with billing cycles (BASIC, PRO)
  const key = `NEXT_PUBLIC_STRIPE_${planType}_${billingCycle}_PRICE_ID`;
  const priceId = env[key as keyof typeof env];
  
  if (!priceId) {
    throw new Error(`Price ID not found for plan ${planType}_${billingCycle}`);
  }
  
  return priceId;
}
