"use server";

import { env } from "@/lib/env";
import Stripe from "stripe";
import { logger } from "./logger";
import { getStripeEnvVar } from "./stripe-env";

// This function initializes and returns a Stripe instance
// It's exported for use in API routes that need direct access
export async function getStripeInstance(): Promise<Stripe> {
  // Always try to get the key from .env.stripe first for test environment
  const stripeKeyEnv = env.NODE_ENV === "production" ? "STRIPE_SECRET_KEY" : "STRIPE_SECRET_KEY_TEST";
  
  // First try to get from .env.stripe file
  let stripeKey = await getStripeEnvVar(stripeKeyEnv);
  
  // Log the source of the key
  if (stripeKey) {
    logger.info(`Using Stripe key from .env.stripe file (${stripeKeyEnv})`);
  } else {
    // Fall back to regular env variables only if not found in .env.stripe
    stripeKey = env.NODE_ENV === "production" ? env.STRIPE_SECRET_KEY : env.STRIPE_SECRET_KEY_TEST;
    if (stripeKey) {
      logger.info(`Using Stripe key from regular env variables (${stripeKeyEnv})`);
    } else {
      logger.warn(`No Stripe key found in either .env.stripe or regular env variables (${stripeKeyEnv})`);
    }
  }

  // Check for missing or malformed API key
  if (!stripeKey || stripeKey.trim() === "" || !stripeKey.startsWith("sk_")) {
    const message = `Missing or invalid Stripe secret key for ${env.NODE_ENV} environment`;
    logger.error(message);
    
    // In development or test, we can use a dummy key for testing UI without actual API calls
    if (env.NODE_ENV !== "production") {
      logger.warn("Using dummy Stripe instance for non-production environment. API calls will fail gracefully.");
      return Promise.resolve(new Stripe("sk_test_51MxDummyKeyForDevelopmentEnvironment", {
        apiVersion: "2024-12-18.acacia",
        typescript: true,
        telemetry: false,
      }));
    }
    
    throw new Error(message);
  }

  try {
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2024-12-18.acacia",
      typescript: true,
      telemetry: false,
    });
    return Promise.resolve(stripe);
  } catch (error) {
    logger.error("Error initializing Stripe client", { error });
    
    // In development or test, use dummy instance as fallback
    if (env.NODE_ENV !== "production") {
      logger.warn("Falling back to dummy Stripe instance due to initialization error");
      return Promise.resolve(new Stripe("sk_test_51MxDummyKeyForDevelopmentEnvironment", {
        apiVersion: "2024-12-18.acacia",
        typescript: true,
        telemetry: false,
      }));
    }
    
    throw error;
  }
}

// Cached instance for client components
let _stripe: Stripe | null = null;

// Export a function that returns the Stripe instance for API routes
// This avoids top-level await which isn't supported in the current TypeScript config
export const getServerStripe = getStripeInstance;

// This function is for client components that need to get the Stripe instance
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
