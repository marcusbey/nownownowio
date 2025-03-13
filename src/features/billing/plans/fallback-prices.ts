/**
 * type Fallback prices for plans when the API is unavailable
 * These values should match the actual prices in Stripe
 */

// Plan types
export const PLAN_TYPES = {
  FREE: "FREE",
  BASIC: "BASIC",
  PRO: "PRO",
} as const;

// Billing cycles
export const BILLING_CYCLES = {
  MONTHLY: "MONTHLY",
  ANNUAL: "ANNUAL",
  LIFETIME: "LIFETIME",
} as const;

// Define types based on the constants
export type PlanType = typeof PLAN_TYPES[keyof typeof PLAN_TYPES];
export type BillingCycleType = typeof BILLING_CYCLES[keyof typeof BILLING_CYCLES];

import { env } from "@/lib/env";

// Determine if we're using live mode
const isLiveMode = env.USE_LIVE_MODE === 'true';

// Fallback prices for each plan and billing cycle
export const FALLBACK_PRICES = {
  // Basic plan pricing
  [PLAN_TYPES.BASIC]: {
    [BILLING_CYCLES.MONTHLY]: {
      amount: 14,
      priceId: isLiveMode
        ? (env.NEXT_PUBLIC_STRIPE_LIVE_BASIC_MONTHLY_PRICE_ID ?? "price_live_basic_monthly")
        : (env.NEXT_PUBLIC_STRIPE_TEST_BASIC_MONTHLY_PRICE_ID ?? env.NEXT_PUBLIC_STRIPE_BASIC_MONTHLY_PRICE_ID ?? "price_1R1ubr00GvYcfU0MkexABC0K"),
    },
    [BILLING_CYCLES.ANNUAL]: {
      amount: 134,
      priceId: isLiveMode
        ? (env.NEXT_PUBLIC_STRIPE_LIVE_BASIC_ANNUAL_PRICE_ID ?? "price_live_basic_annual")
        : (env.NEXT_PUBLIC_STRIPE_TEST_BASIC_ANNUAL_PRICE_ID ?? env.NEXT_PUBLIC_STRIPE_BASIC_ANNUAL_PRICE_ID ?? "price_1R1ubs00GvYcfU0MVILrkrXu"),
    },
    [BILLING_CYCLES.LIFETIME]: {
      amount: 299,
      priceId: isLiveMode
        ? (env.NEXT_PUBLIC_STRIPE_LIVE_BASIC_LIFETIME_PRICE_ID ?? "price_live_basic_lifetime")
        : (env.NEXT_PUBLIC_STRIPE_TEST_BASIC_LIFETIME_PRICE_ID ?? env.NEXT_PUBLIC_STRIPE_BASIC_LIFETIME_PRICE_ID ?? "price_1R1ubs00GvYcfU0MjwWuRoQl"),
    },
  },
  // Pro plan pricing
  [PLAN_TYPES.PRO]: {
    [BILLING_CYCLES.MONTHLY]: {
      amount: 29,
      priceId: isLiveMode
        ? (env.NEXT_PUBLIC_STRIPE_LIVE_PRO_MONTHLY_PRICE_ID ?? "price_live_pro_monthly")
        : (env.NEXT_PUBLIC_STRIPE_TEST_PRO_MONTHLY_PRICE_ID ?? env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID ?? "price_1R1ubt00GvYcfU0MJEmE8Sr4"),
    },
    [BILLING_CYCLES.ANNUAL]: {
      amount: 278,
      priceId: isLiveMode
        ? (env.NEXT_PUBLIC_STRIPE_LIVE_PRO_ANNUAL_PRICE_ID ?? "price_live_pro_annual")
        : (env.NEXT_PUBLIC_STRIPE_TEST_PRO_ANNUAL_PRICE_ID ?? env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID ?? "price_1R1ubt00GvYcfU0MQ1ycwSSR"),
    },
    [BILLING_CYCLES.LIFETIME]: {
      amount: 599,
      priceId: isLiveMode
        ? (env.NEXT_PUBLIC_STRIPE_LIVE_PRO_LIFETIME_PRICE_ID ?? "price_live_pro_lifetime")
        : (env.NEXT_PUBLIC_STRIPE_TEST_PRO_LIFETIME_PRICE_ID ?? env.NEXT_PUBLIC_STRIPE_PRO_LIFETIME_PRICE_ID ?? "price_1R1ubu00GvYcfU0MnRIkuKso"),
    },
  },
  // Free plan (always $0)
  [PLAN_TYPES.FREE]: {
    [BILLING_CYCLES.MONTHLY]: {
      amount: 0,
      priceId: isLiveMode
        ? (env.NEXT_PUBLIC_STRIPE_LIVE_FREE_PRICE_ID ?? "price_live_free")
        : (env.NEXT_PUBLIC_STRIPE_TEST_FREE_PRICE_ID ?? env.NEXT_PUBLIC_STRIPE_FREE_PRICE_ID ?? "price_1R1ubu00GvYcfU0MYAobzL7F"),
    },
    [BILLING_CYCLES.ANNUAL]: {
      amount: 0,
      priceId: isLiveMode
        ? (env.NEXT_PUBLIC_STRIPE_LIVE_FREE_PRICE_ID ?? "price_live_free")
        : (env.NEXT_PUBLIC_STRIPE_TEST_FREE_PRICE_ID ?? env.NEXT_PUBLIC_STRIPE_FREE_PRICE_ID ?? "price_1R1ubu00GvYcfU0MYAobzL7F"),
    },
    [BILLING_CYCLES.LIFETIME]: {
      amount: 0,
      priceId: isLiveMode
        ? (env.NEXT_PUBLIC_STRIPE_LIVE_FREE_PRICE_ID ?? "price_live_free")
        : (env.NEXT_PUBLIC_STRIPE_TEST_FREE_PRICE_ID ?? env.NEXT_PUBLIC_STRIPE_FREE_PRICE_ID ?? "price_1R1ubu00GvYcfU0MYAobzL7F"),
    },
  },
  // Add-ons
  ADDONS: {
    ADDITIONAL_ORG: {
      [BILLING_CYCLES.MONTHLY]: {
        amount: 9,
        priceId: isLiveMode
          ? (env.NEXT_PUBLIC_STRIPE_LIVE_ADDON_ORG_MONTHLY_PRICE_ID ?? "price_live_addon_org_monthly")
          : (env.NEXT_PUBLIC_STRIPE_TEST_ADDON_ORG_MONTHLY_PRICE_ID ?? env.NEXT_PUBLIC_STRIPE_ADDON_ORG_MONTHLY_PRICE_ID ?? "price_1R1ubv00GvYcfU0MFTb2aQhC"),
      },
      [BILLING_CYCLES.ANNUAL]: {
        amount: 86,
        priceId: isLiveMode
          ? (env.NEXT_PUBLIC_STRIPE_LIVE_ADDON_ORG_ANNUAL_PRICE_ID ?? "price_live_addon_org_annual")
          : (env.NEXT_PUBLIC_STRIPE_TEST_ADDON_ORG_ANNUAL_PRICE_ID ?? env.NEXT_PUBLIC_STRIPE_ADDON_ORG_ANNUAL_PRICE_ID ?? "price_1R1ubv00GvYcfU0MEP7P2lGu"),
      },
    },
    ADDITIONAL_MEMBER: {
      [BILLING_CYCLES.MONTHLY]: {
        amount: 5,
        priceId: isLiveMode
          ? (env.NEXT_PUBLIC_STRIPE_LIVE_ADDON_MEMBER_MONTHLY_PRICE_ID ?? "price_live_addon_member_monthly")
          : (env.NEXT_PUBLIC_STRIPE_TEST_ADDON_MEMBER_MONTHLY_PRICE_ID ?? env.NEXT_PUBLIC_STRIPE_ADDON_MEMBER_MONTHLY_PRICE_ID ?? "price_1R1ubw00GvYcfU0Mw9Og8Frp"),
      },
      [BILLING_CYCLES.ANNUAL]: {
        amount: 48,
        priceId: isLiveMode
          ? (env.NEXT_PUBLIC_STRIPE_LIVE_ADDON_MEMBER_ANNUAL_PRICE_ID ?? "price_live_addon_member_annual")
          : (env.NEXT_PUBLIC_STRIPE_TEST_ADDON_MEMBER_ANNUAL_PRICE_ID ?? env.NEXT_PUBLIC_STRIPE_ADDON_MEMBER_ANNUAL_PRICE_ID ?? "price_1R1ubx00GvYcfU0MPIFbifxU"),
      },
    },
  },
};

// Add-on pricing
export const ADDON_FALLBACK_PRICES = {
  ADDITIONAL_ORG: {
    [BILLING_CYCLES.MONTHLY]: {
      amount: 9,
      priceId: isLiveMode
        ? (env.NEXT_PUBLIC_STRIPE_LIVE_ADDON_ORG_MONTHLY_PRICE_ID ?? "price_live_addon_org_monthly")
        : (env.NEXT_PUBLIC_STRIPE_TEST_ADDON_ORG_MONTHLY_PRICE_ID ?? env.NEXT_PUBLIC_STRIPE_ADDON_ORG_MONTHLY_PRICE_ID ?? "price_1R1ubv00GvYcfU0MFTb2aQhC"),
    },
    [BILLING_CYCLES.ANNUAL]: {
      amount: 86,
      priceId: isLiveMode
        ? (env.NEXT_PUBLIC_STRIPE_LIVE_ADDON_ORG_ANNUAL_PRICE_ID ?? "price_live_addon_org_annual")
        : (env.NEXT_PUBLIC_STRIPE_TEST_ADDON_ORG_ANNUAL_PRICE_ID ?? env.NEXT_PUBLIC_STRIPE_ADDON_ORG_ANNUAL_PRICE_ID ?? "price_1R1ubv00GvYcfU0MEP7P2lGu"),
    },
  },
  ADDITIONAL_MEMBER: {
    [BILLING_CYCLES.MONTHLY]: {
      amount: 5,
      priceId: isLiveMode
        ? (env.NEXT_PUBLIC_STRIPE_LIVE_ADDON_MEMBER_MONTHLY_PRICE_ID ?? "price_live_addon_member_monthly")
        : (env.NEXT_PUBLIC_STRIPE_TEST_ADDON_MEMBER_MONTHLY_PRICE_ID ?? env.NEXT_PUBLIC_STRIPE_ADDON_MEMBER_MONTHLY_PRICE_ID ?? "price_1R1ubw00GvYcfU0Mw9Og8Frp"),
    },
    [BILLING_CYCLES.ANNUAL]: {
      amount: 48,
      priceId: isLiveMode
        ? (env.NEXT_PUBLIC_STRIPE_LIVE_ADDON_MEMBER_ANNUAL_PRICE_ID ?? "price_live_addon_member_annual")
        : (env.NEXT_PUBLIC_STRIPE_TEST_ADDON_MEMBER_ANNUAL_PRICE_ID ?? env.NEXT_PUBLIC_STRIPE_ADDON_MEMBER_ANNUAL_PRICE_ID ?? "price_1R1ubx00GvYcfU0MPIFbifxU"),
    },
  },
};

/**
 * Helper functions to get pricing information
 */

/**
 * Get the price amount for a given plan type and billing cycle
 */
export function getFallbackPriceAmount(
  planType: PlanType,
  billingCycle: BillingCycleType
): number {
  // Safely access the FALLBACK_PRICES with proper type checking
  const planPrices = FALLBACK_PRICES[planType as keyof typeof FALLBACK_PRICES];
  
  if (!planPrices) {
    // Default fallback values if the plan type doesn't exist
    return planType === PLAN_TYPES.BASIC ? 14 : planType === PLAN_TYPES.PRO ? 29 : 0;
  }
  
  // Use a type assertion with unknown first, then check properties
  const cyclePrices = planPrices[billingCycle as string] as unknown;
  
  // Type guard to ensure we have the expected structure
  if (!cyclePrices || typeof cyclePrices !== 'object' || !('amount' in cyclePrices)) {
    // Default fallback values if the billing cycle doesn't exist
    return planType === PLAN_TYPES.BASIC ? 14 : planType === PLAN_TYPES.PRO ? 29 : 0;
  }
  
  return cyclePrices.amount;
}

/**
 * Get the price ID for a given plan type and billing cycle
 */
export function getFallbackPriceId(
  planType: PlanType,
  billingCycle: BillingCycleType
): string {
  // Safely access the FALLBACK_PRICES with proper type checking
  const planPrices = FALLBACK_PRICES[planType as keyof typeof FALLBACK_PRICES];
  
  if (!planPrices) {
    // Default fallback values if the plan type doesn't exist
    return planType === PLAN_TYPES.BASIC
      ? "price_1QzYbI00GvYcfU0MBsWqwG00"
      : planType === PLAN_TYPES.PRO
        ? "price_1QzYbJ00GvYcfU0MJ9DAV1fT"
        : "price_1QzYDJ00GvYcfU0MjEsFp4Md";
  }
  
  // Use a type assertion with unknown first, then check properties
  const cyclePrices = planPrices[billingCycle as string] as unknown;
  
  // Type guard to ensure we have the expected structure
  if (!cyclePrices || typeof cyclePrices !== 'object' || !('priceId' in cyclePrices)) {
    // Default fallback values if the billing cycle doesn't exist
    return planType === PLAN_TYPES.BASIC
      ? "price_1QzYbI00GvYcfU0MBsWqwG00"
      : planType === PLAN_TYPES.PRO
        ? "price_1QzYbJ00GvYcfU0MJ9DAV1fT"
        : "price_1QzYDJ00GvYcfU0MjEsFp4Md";
  }
  
  return cyclePrices.priceId;
}

/**
 * Get the price amount for an add-on
 */
export function getAddonFallbackPriceAmount(
  addonType: "ADDITIONAL_ORG" | "ADDITIONAL_MEMBER",
  billingCycle: BillingCycleType
): number {
  if (billingCycle === BILLING_CYCLES.LIFETIME) {
    // No lifetime pricing for add-ons
    return addonType === "ADDITIONAL_ORG" ? 9 : 5;
  }

  // Only check MONTHLY and ANNUAL billing cycles
  const validBillingCycle = billingCycle === BILLING_CYCLES.MONTHLY ? BILLING_CYCLES.MONTHLY : BILLING_CYCLES.ANNUAL;

  // Default fallback values if the combination doesn't exist
  return ADDON_FALLBACK_PRICES[addonType][validBillingCycle].amount ??
    (addonType === "ADDITIONAL_ORG" ? 9 : 5);
}

/**
 * Get the price ID for an add-on
 */
export function getAddonFallbackPriceId(
  addonType: "ADDITIONAL_ORG" | "ADDITIONAL_MEMBER",
  billingCycle: BillingCycleType
): string {
  if (billingCycle === BILLING_CYCLES.LIFETIME) {
    // No lifetime pricing for add-ons
    return addonType === "ADDITIONAL_ORG"
      ? "price_addon_org_monthly"
      : "price_addon_member_monthly";
  }

  // Only check MONTHLY and ANNUAL billing cycles
  const validBillingCycle = billingCycle === BILLING_CYCLES.MONTHLY ? BILLING_CYCLES.MONTHLY : BILLING_CYCLES.ANNUAL;

  // Default fallback values if the combination doesn't exist
  return ADDON_FALLBACK_PRICES[addonType][validBillingCycle].priceId ??
    (addonType === "ADDITIONAL_ORG" ? "price_addon_org_monthly" : "price_addon_member_monthly");
}
