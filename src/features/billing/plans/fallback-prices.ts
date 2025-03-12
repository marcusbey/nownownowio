import type { BillingCycle, OrganizationPlanType } from "@/lib/types";

/**
 * Fallback prices for plans when the API is unavailable
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

// Fallback prices for each plan and billing cycle
export const FALLBACK_PRICES = {
  // Basic plan pricing
  [PLAN_TYPES.BASIC]: {
    [BILLING_CYCLES.MONTHLY]: {
      amount: 14,
      priceId: "price_1QzYbI00GvYcfU0MBsWqwG00",
    },
    [BILLING_CYCLES.ANNUAL]: {
      amount: 134,
      priceId: "price_1QzYbJ00GvYcfU0Mqcv86bkd",
    },
    [BILLING_CYCLES.LIFETIME]: {
      amount: 299,
      priceId: "price_1QzYbJ00GvYcfU0MdGUvVrrF",
    },
  },
  // Pro plan pricing
  [PLAN_TYPES.PRO]: {
    [BILLING_CYCLES.MONTHLY]: {
      amount: 29,
      priceId: "price_1QzYbJ00GvYcfU0MJ9DAV1fT",
    },
    [BILLING_CYCLES.ANNUAL]: {
      amount: 278,
      priceId: "price_1QzYbK00GvYcfU0MlDlgfKHA",
    },
    [BILLING_CYCLES.LIFETIME]: {
      amount: 599,
      priceId: "price_1QzYbK00GvYcfU0MSApINROv",
    },
  },
  // Free plan (always $0)
  [PLAN_TYPES.FREE]: {
    [BILLING_CYCLES.MONTHLY]: {
      amount: 0,
      priceId: "price_1QzYDJ00GvYcfU0MjEsFp4Md",
    },
    [BILLING_CYCLES.ANNUAL]: {
      amount: 0,
      priceId: "price_1QzYDJ00GvYcfU0MjEsFp4Md",
    },
    [BILLING_CYCLES.LIFETIME]: {
      amount: 0,
      priceId: "price_1QzYDJ00GvYcfU0MjEsFp4Md",
    },
  },
};

// Add-on pricing
export const ADDON_FALLBACK_PRICES = {
  ADDITIONAL_ORG: {
    [BILLING_CYCLES.MONTHLY]: {
      amount: 9,
      priceId: "price_addon_org_monthly",
    },
    [BILLING_CYCLES.ANNUAL]: {
      amount: 86,
      priceId: "price_addon_org_annual",
    },
  },
  ADDITIONAL_MEMBER: {
    [BILLING_CYCLES.MONTHLY]: {
      amount: 5,
      priceId: "price_addon_member_monthly",
    },
    [BILLING_CYCLES.ANNUAL]: {
      amount: 48,
      priceId: "price_addon_member_annual",
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
  planType: OrganizationPlanType,
  billingCycle: BillingCycle
): number {
  return (
    FALLBACK_PRICES[planType]?.[billingCycle]?.amount ||
    // Default fallback values if the combination doesn't exist
    (planType === PLAN_TYPES.BASIC
      ? 14
      : planType === PLAN_TYPES.PRO
        ? 29
        : 0)
  );
}

/**
 * Get the price ID for a given plan type and billing cycle
 */
export function getFallbackPriceId(
  planType: OrganizationPlanType,
  billingCycle: BillingCycle
): string {
  return (
    FALLBACK_PRICES[planType]?.[billingCycle]?.priceId ||
    // Default fallback values if the combination doesn't exist
    (planType === PLAN_TYPES.BASIC
      ? "price_basic_monthly"
      : planType === PLAN_TYPES.PRO
        ? "price_pro_monthly"
        : "price_free")
  );
}

/**
 * Get the price amount for an add-on
 */
export function getAddonFallbackPriceAmount(
  addonType: "ADDITIONAL_ORG" | "ADDITIONAL_MEMBER",
  billingCycle: BillingCycle
): number {
  if (billingCycle === BILLING_CYCLES.LIFETIME) {
    // No lifetime pricing for add-ons
    return addonType === "ADDITIONAL_ORG" ? 9 : 5;
  }

  return (
    ADDON_FALLBACK_PRICES[addonType][billingCycle]?.amount ||
    // Default fallback values if the combination doesn't exist
    (addonType === "ADDITIONAL_ORG" ? 9 : 5)
  );
}

/**
 * Get the price ID for an add-on
 */
export function getAddonFallbackPriceId(
  addonType: "ADDITIONAL_ORG" | "ADDITIONAL_MEMBER",
  billingCycle: BillingCycle
): string {
  if (billingCycle === BILLING_CYCLES.LIFETIME) {
    // No lifetime pricing for add-ons
    return addonType === "ADDITIONAL_ORG"
      ? "price_addon_org_monthly"
      : "price_addon_member_monthly";
  }

  return (
    ADDON_FALLBACK_PRICES[addonType][billingCycle]?.priceId ||
    // Default fallback values if the combination doesn't exist
    (addonType === "ADDITIONAL_ORG"
      ? "price_addon_org_monthly"
      : "price_addon_member_monthly")
  );
}
