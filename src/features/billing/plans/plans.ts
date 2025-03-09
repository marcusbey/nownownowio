import { z } from "zod";

// Import types from Prisma schema
// These are the enum values defined in the Prisma schema
export const PLAN_TYPES = {
  FREE: "FREE",
  BASIC: "BASIC",
  PRO: "PRO"
} as const;

export const BILLING_CYCLES = {
  MONTHLY: "MONTHLY",
  ANNUAL: "ANNUAL",
  LIFETIME: "LIFETIME"
} as const;

// Define plan types and billing cycles to match the database structure
export const PlanType = z.enum([PLAN_TYPES.FREE, PLAN_TYPES.BASIC, PLAN_TYPES.PRO]);
export type PlanType = z.infer<typeof PlanType>;

export const BillingCycle = z.enum([BILLING_CYCLES.MONTHLY, BILLING_CYCLES.ANNUAL, BILLING_CYCLES.LIFETIME]);
export type BillingCycle = z.infer<typeof BillingCycle>;

export const PlanId = z.enum([
  "FREE", "BASIC_MONTHLY", "BASIC_ANNUAL", "BASIC_LIFETIME", 
  "PRO_MONTHLY", "PRO_ANNUAL", "PRO_LIFETIME"
]);
export type PlanId = z.infer<typeof PlanId>;

// Using type instead of interface as per TypeScript usage rules
export type Plan = {
  id: PlanId;
  name: string;
  description: string;
  subtitle?: string;
  features: string[];
  price?: number;
  yearlyPrice?: number;
  priceId?: string;
  yearlyPriceId?: string;
  planType: PlanType;
  billingCycle: BillingCycle;
  isPopular?: boolean;
  className?: string;
  currency?: string;
  cta?: string;
  ctaSubtitle?: string;
  barredPrice?: number;
  maxOrganizations: number;
  maxMembers: number;
  maxWidgets: number;
  monthlyViews: number;
  hasBranding?: boolean;
  hasTrial?: boolean;
  trialDays?: number;
}


export const PLANS: Plan[] = [
  {
    id: "BASIC_MONTHLY",
    name: "Basic",
    description: "Perfect for individuals and personal websites",
    planType: PLAN_TYPES.BASIC, // Using constant from PLAN_TYPESts file. 
    billingCycle: BILLING_CYCLES.MONTHLY,
    features: [
      "1 organization/project",
      "1 widget (can be embedded on multiple websites)",
      "Same feed appears across all embeddings",
      "\"Powered by NowNowNow\" branding",
      "Unlimited posts",
      "Unlimited widget views",
      "Full post management (pin, edit, delete, archive)",
      "1 team member",
      "Email support"
    ],
    price: 9,
    priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_MONTHLY_PRICE_ID,
    cta: "Get Started",
    ctaSubtitle: "$9/month",
    maxOrganizations: 1,
    maxMembers: 1,
    maxWidgets: 1,
    monthlyViews: -1, // Unlimited
    hasBranding: true
  },
  {
    id: "BASIC_ANNUAL",
    name: "Basic",
    description: "Perfect for individuals and personal websites",
    planType: PLAN_TYPES.BASIC, // Using constant from PLAN_TYPES
    billingCycle: BILLING_CYCLES.ANNUAL,
    features: [
      "1 organization/project",
      "1 widget (can be embedded on multiple websites)",
      "Same feed appears across all embeddings",
      "\"Powered by NowNowNow\" branding",
      "Unlimited posts",
      "Unlimited widget views",
      "Full post management (pin, edit, delete, archive)",
      "1 team member",
      "Email support",
      "Save 20% with annual billing"
    ],
    price: 7.2, // 20% discount
    yearlyPrice: 86.4, // $9 * 12 * 0.8
    barredPrice: 9,
    priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_ANNUAL_PRICE_ID,
    cta: "Get Started",
    ctaSubtitle: "$7.20/month, billed annually",
    maxOrganizations: 1,
    maxMembers: 1,
    maxWidgets: 1,
    monthlyViews: -1, // Unlimited
    hasBranding: true
  },
  {
    id: "BASIC_LIFETIME",
    name: "Basic Lifetime",
    description: "Perfect for individuals and personal websites",
    planType: PLAN_TYPES.BASIC, // Using constant from PLAN_TYPES
    billingCycle: BILLING_CYCLES.LIFETIME,
    features: [
      "1 organization/project",
      "1 widget (can be embedded on multiple websites)",
      "Same feed appears across all embeddings",
      "\"Powered by NowNowNow\" branding",
      "Unlimited posts",
      "Unlimited widget views",
      "Full post management (pin, edit, delete, archive)",
      "1 team member",
      "Email support",
      "One-time payment",
      "Lifetime access",
      "All future updates included"
    ],
    price: 199,
    priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_LIFETIME_PRICE_ID,
    cta: "Buy Lifetime Access",
    ctaSubtitle: "One-time payment of $199",
    maxOrganizations: 1,
    maxMembers: 1,
    maxWidgets: 1,
    monthlyViews: -1, // Unlimited
    hasBranding: true
  },
  {
    id: "PRO_MONTHLY",
    name: "Pro",
    description: "For entrepreneurs with multiple projects",
    planType: PLAN_TYPES.PRO, // Using constant from PLAN_TYPES
    billingCycle: BILLING_CYCLES.MONTHLY,
    features: [
      "5 organizations/projects",
      "5 widgets (1 per organization)",
      "Each widget can be embedded on multiple websites",
      "Optional \"Powered by NowNowNow\" branding",
      "Unlimited posts for each organization",
      "Unlimited widget views",
      "Full post management",
      "Up to 5 team members",
      "Customers Feedback",
      "User chat functionality",
      "Advanced analytics dashboard",
      "Priority support",
      "Priority access to new features"
    ],
    price: 19,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
    cta: "Get Started",
    ctaSubtitle: "$19/month",
    isPopular: true,
    maxOrganizations: 5,
    maxMembers: 5,
    maxWidgets: 5,
    monthlyViews: -1, // Unlimited
    hasBranding: false
  },
  {
    id: "PRO_ANNUAL",
    name: "Pro",
    description: "For entrepreneurs with multiple projects",
    planType: PLAN_TYPES.PRO, // Using constant from PLAN_TYPES
    billingCycle: BILLING_CYCLES.ANNUAL,
    features: [
      "5 organizations/projects",
      "5 widgets (1 per organization)",
      "Each widget can be embedded on multiple websites",
      "Optional \"Powered by NowNowNow\" branding",
      "Unlimited posts for each organization",
      "Unlimited widget views",
      "Full post management",
      "Up to 5 team members",
      "Customers Feedback",
      "User chat functionality",
      "Advanced analytics dashboard",
      "Priority support",
      "Priority access to new features",
      "Save 20% with annual billing"
    ],
    price: 15.2, // 20% discount
    yearlyPrice: 182.4, // $19 * 12 * 0.8
    barredPrice: 19,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID,
    cta: "Get Started",
    ctaSubtitle: "$15.20/month, billed annually",
    isPopular: true,
    maxOrganizations: 5,
    maxMembers: 5,
    maxWidgets: 5,
    monthlyViews: -1, // Unlimited
    hasBranding: false
  },
  {
    id: "PRO_LIFETIME",
    name: "Pro Lifetime",
    description: "For entrepreneurs with multiple projects",
    planType: PLAN_TYPES.PRO, // Using constant from PLAN_TYPES
    billingCycle: BILLING_CYCLES.LIFETIME,
    features: [
      "5 organizations/projects",
      "5 widgets (1 per organization)",
      "Each widget can be embedded on multiple websites",
      "Optional \"Powered by NowNowNow\" branding",
      "Unlimited posts for each organization",
      "Unlimited widget views",
      "Full post management",
      "Up to 5 team members",
      "Customers Feedback",
      "User chat functionality",
      "Advanced analytics dashboard",
      "Priority support",
      "Priority access to new features",
      "Lifetime access",
      "All future updates included"
    ],
    price: 399,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_LIFETIME_PRICE_ID,
    cta: "Buy Lifetime Access",
    ctaSubtitle: "One-time payment of $499",
    isPopular: false,
    maxOrganizations: 5,
    maxMembers: 5,
    maxWidgets: 5,
    monthlyViews: -1, // Unlimited
    hasBranding: false
  },
  {
    id: "FREE",
    name: "Free",
    description: "Try out NowNowNow with basic features",
    planType: "FREE",
    billingCycle: BILLING_CYCLES.MONTHLY,
    features: [
      "1 organization/project",
      "1 widget (can be embedded on multiple websites)",
      "Same feed appears across all embeddings",
      "\"Powered by NowNowNow\" branding",
      "Limited posts",
      "Limited widget views",
      "Basic post management",
      "1 team member",
      "Email support"
    ],
    price: 0,
    cta: "Start Free",
    ctaSubtitle: "No credit card required",
    maxOrganizations: 1,
    maxMembers: 1,
    maxWidgets: 1,
    monthlyViews: 500,
    hasBranding: true
  },
];
