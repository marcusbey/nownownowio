'use server'

import Stripe from "stripe";
import { env } from "./env";

let stripeInstance: Stripe | null = null;

export async function getStripeInstance() {
  if (!stripeInstance) {
    // Use test keys in development and test environments
    const isTestMode = process.env.NODE_ENV !== 'production';
    const secretKey = isTestMode ? env.STRIPE_SECRET_KEY_TEST : env.STRIPE_SECRET_KEY;
    
    stripeInstance = new Stripe(secretKey, {
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

export async function createCommunityPromotionCode(params: {
  name: string;
  maxRedemptions?: number;
  expiresAt?: number;
}) {
  const stripe = await getStripeInstance();
  
  // First, create a coupon for 100% off for 12 months
  const coupon = await stripe.coupons.create({
    duration: 'repeating',
    duration_in_months: 12,
    percent_off: 100,
    name: `${params.name} - 1 Year Free`,
  });

  // Then create a promotion code linked to this coupon
  const promotionCode = await stripe.promotionCodes.create({
    coupon: coupon.id,
    code: `${params.name.toUpperCase()}-1YEAR-${Math.random().toString(36).substr(2, 6)}`,
    max_redemptions: params.maxRedemptions,
    expires_at: params.expiresAt,
  });

  return promotionCode;
}

export async function getPromotionCode(code: string) {
  const stripe = await getStripeInstance();
  const promotionCodes = await stripe.promotionCodes.list({
    code,
    active: true,
  });
  return promotionCodes.data[0];
}

export async function createBulkPromotionCode(params: {
  campaignName: string;
  maxRedemptions?: number;
  expiresAt?: number;
}) {
  const stripe = await getStripeInstance();
  
  // Create a coupon for 100% off for 12 months
  const coupon = await stripe.coupons.create({
    duration: 'repeating',
    duration_in_months: 12,
    percent_off: 100,
    name: `${params.campaignName} - 1 Year Free`,
  });

  // Create a simple, memorable promotion code
  const promotionCode = await stripe.promotionCodes.create({
    coupon: coupon.id,
    code: params.campaignName.toUpperCase().replace(/[^A-Z0-9]/g, ''),
    max_redemptions: params.maxRedemptions,
    expires_at: params.expiresAt,
    metadata: {
      type: 'bulk_promotion',
      campaign: params.campaignName,
      unlimited: params.maxRedemptions ? 'false' : 'true'
    }
  });

  return promotionCode;
}

export async function getPromotionCodeStats(code: string) {
  const stripe = await getStripeInstance();
  const promotionCode = await stripe.promotionCodes.retrieve(code);
  
  return {
    code: promotionCode.code,
    active: promotionCode.active,
    maxRedemptions: promotionCode.max_redemptions,
    timesRedeemed: promotionCode.times_redeemed,
    remainingRedemptions: promotionCode.max_redemptions ? 
      promotionCode.max_redemptions - (promotionCode.times_redeemed || 0) : 
      null,
    expiresAt: promotionCode.expires_at,
    metadata: promotionCode.metadata
  };
}

export async function createStripeCheckoutSession(params: {
  priceId: string;
  customerId: string;
  successUrl: string;
  cancelUrl: string;
  promotionCode?: string;
}) {
  const stripe = await getStripeInstance();
  return stripe.checkout.sessions.create({
    customer: params.customerId,
    line_items: [{ price: params.priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    allow_promotion_codes: true,
    promotion_code: params.promotionCode,
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
