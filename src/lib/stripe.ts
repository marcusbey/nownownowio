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
    
    // In development, we can use a dummy key for testing UI without actual API calls
    if (env.NODE_ENV === "development") {
      logger.warn("Using dummy Stripe instance for development. API calls will fail gracefully.");
      return Promise.resolve(new Stripe("sk_test_dummy_key_for_development", {
        apiVersion: "2024-12-18.acacia",
        typescript: true,
        telemetry: false,
      }));
    }
    
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

  // Ensure we have a valid webhook secret
  const finalSecret = webhookSecret || secret;
  if (!finalSecret) {
    throw new Error(`Missing Stripe webhook secret for ${env.NODE_ENV} environment`);
  }

  const stripe = await getStripe();
  return stripe.webhooks.constructEvent(payload, signature, finalSecret);
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
  // Determine if we're using live mode or test mode
  const isLiveMode = env.USE_LIVE_MODE === 'true';
  const modePrefix = isLiveMode ? 'LIVE' : 'TEST';
  
  // Handle FREE plan which doesn't have billing cycles
  if (planType === 'FREE') {
    // Try to get mode-specific free price ID first
    const modeSpecificKey = `NEXT_PUBLIC_STRIPE_${modePrefix}_FREE_PRICE_ID`;
    const modeSpecificPriceId = env[modeSpecificKey as keyof typeof env];
    
    if (modeSpecificPriceId) {
      return modeSpecificPriceId;
    }
    
    // Fall back to default free price ID
    const defaultKey = 'NEXT_PUBLIC_STRIPE_FREE_PRICE_ID';
    const defaultPriceId = env[defaultKey as keyof typeof env];
    
    if (!defaultPriceId) {
      throw new Error(`Price ID not found for FREE plan`);
    }
    
    return defaultPriceId;
  }
  
  // Handle regular plans with billing cycles (BASIC, PRO) and addons
  // Try to get mode-specific price ID first
  const modeSpecificKey = `NEXT_PUBLIC_STRIPE_${modePrefix}_${planType}_${billingCycle}_PRICE_ID`;
  const modeSpecificPriceId = env[modeSpecificKey as keyof typeof env];
  
  if (modeSpecificPriceId) {
    return modeSpecificPriceId;
  }
  
  // Fall back to default price ID
  const defaultKey = `NEXT_PUBLIC_STRIPE_${planType}_${billingCycle}_PRICE_ID`;
  const defaultPriceId = env[defaultKey as keyof typeof env];
  
  if (!defaultPriceId) {
    throw new Error(`Price ID not found for plan ${planType}_${billingCycle}`);
  }
  
  return defaultPriceId;
}
