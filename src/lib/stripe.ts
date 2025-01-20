'use server'

import Stripe from "stripe";
import { env } from "./env";

let stripeInstance: Stripe | null = null;

export async function getStripeInstance() {
  if (!stripeInstance) {
    stripeInstance = new Stripe(env.STRIPE_SECRET_KEY, {
      typescript: true,
      apiVersion: '2023-10-16',
    });
  }
  return stripeInstance;
}

export async function getStripePrices() {
  const stripe = await getStripeInstance();
  const prices = await stripe.prices.list({
    active: true,
    expand: ['data.product'],
  });
  return prices.data;
}

export async function getStripeSubscription(subscriptionId: string) {
  const stripe = await getStripeInstance();
  return stripe.subscriptions.retrieve(subscriptionId);
}

export async function createStripeCheckoutSession(params: {
  priceId: string;
  customerId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const stripe = await getStripeInstance();
  return stripe.checkout.sessions.create({
    customer: params.customerId,
    line_items: [{ price: params.priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  });
}

export async function createStripeBillingPortalSession(params: {
  customerId: string;
  returnUrl: string;
}) {
  const stripe = await getStripeInstance();
  return stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  });
}
