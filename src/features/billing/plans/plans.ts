import { z } from "zod";

// Define plan types and billing cycles
export const PlanType = z.enum(["FREE", "BASIC", "PRO"]);
export type PlanType = z.infer<typeof PlanType>;

export const BillingCycle = z.enum(["MONTHLY", "ANNUAL", "LIFETIME"]);
export type BillingCycle = z.infer<typeof BillingCycle>;

export const PlanId = z.enum(["FREE", "BASIC_MONTHLY", "BASIC_ANNUAL", "BASIC_LIFETIME", "PRO_MONTHLY", "PRO_ANNUAL", "PRO_LIFETIME"]);
export type PlanId = z.infer<typeof PlanId>;

export interface Plan {
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
  maxMembers: number;
  maxWidgets: number;
  monthlyViews: number;
}

export const PLANS: Plan[] = [
  {
    id: "FREE",
    name: "Free",
    description: "For individuals getting started",
    planType: "FREE",
    billingCycle: "MONTHLY",
    features: [
      "1 organization",
      "1 member per organization",
      "2 widgets",
      "1,000 monthly views",
      "Basic analytics",
      "Community support"
    ],
    price: 0,
    priceId: "price_free", // This is a placeholder, as free plans don't need a price ID
    cta: "Get Started",
    ctaSubtitle: "No credit card required",
    maxMembers: 1,
    maxWidgets: 2,
    monthlyViews: 1000
  },
  {
    id: "BASIC_MONTHLY",
    name: "Basic",
    description: "For growing creators",
    planType: "BASIC",
    billingCycle: "MONTHLY",
    features: [
      "3 organizations",
      "5 members per organization",
      "10 widgets",
      "10,000 monthly views",
      "Advanced analytics",
      "Priority support",
      "Custom branding"
    ],
    price: 14,
    priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_MONTHLY_PRICE_ID,
    cta: "Subscribe Monthly",
    ctaSubtitle: "Billed monthly",
    isPopular: true,
    maxMembers: 5,
    maxWidgets: 10,
    monthlyViews: 10000
  },
  {
    id: "BASIC_ANNUAL",
    name: "Basic",
    description: "For growing creators",
    planType: "BASIC",
    billingCycle: "ANNUAL",
    features: [
      "3 organizations",
      "5 members per organization",
      "10 widgets",
      "10,000 monthly views",
      "Advanced analytics",
      "Priority support",
      "Custom branding",
      "Save 15% annually"
    ],
    price: 144,
    barredPrice: 168, // 14 * 12 = 168 (monthly price * 12)
    priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_ANNUAL_PRICE_ID,
    cta: "Subscribe Annually",
    ctaSubtitle: "Billed annually",
    isPopular: true,
    maxMembers: 5,
    maxWidgets: 10,
    monthlyViews: 10000
  },
  {
    id: "BASIC_LIFETIME",
    name: "Basic Lifetime",
    description: "For committed creators",
    planType: "BASIC",
    billingCycle: "LIFETIME",
    features: [
      "3 organizations",
      "5 members per organization",
      "10 widgets",
      "10,000 monthly views",
      "Advanced analytics",
      "Priority support",
      "Custom branding",
      "One-time payment",
      "Lifetime access"
    ],
    price: 299,
    priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_LIFETIME_PRICE_ID,
    cta: "Get Lifetime Access",
    ctaSubtitle: "One-time payment",
    maxMembers: 5,
    maxWidgets: 10,
    monthlyViews: 10000
  },
  {
    id: "PRO_MONTHLY",
    name: "Pro",
    description: "For professional teams",
    planType: "PRO",
    billingCycle: "MONTHLY",
    features: [
      "Unlimited organizations",
      "Unlimited members",
      "Unlimited widgets",
      "Unlimited monthly views",
      "Advanced analytics",
      "Premium support",
      "Custom branding",
      "API access",
      "Advanced integrations"
    ],
    price: 49,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
    cta: "Subscribe Monthly",
    ctaSubtitle: "Billed monthly",
    maxMembers: Infinity,
    maxWidgets: Infinity,
    monthlyViews: Infinity
  },
  {
    id: "PRO_ANNUAL",
    name: "Pro",
    description: "For professional teams",
    planType: "PRO",
    billingCycle: "ANNUAL",
    features: [
      "Unlimited organizations",
      "Unlimited members",
      "Unlimited widgets",
      "Unlimited monthly views",
      "Advanced analytics",
      "Premium support",
      "Custom branding",
      "API access",
      "Advanced integrations",
      "Save 15% annually"
    ],
    price: 499,
    barredPrice: 588, // 49 * 12 = 588 (monthly price * 12)
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID,
    cta: "Subscribe Annually",
    ctaSubtitle: "Billed annually",
    maxMembers: Infinity,
    maxWidgets: Infinity,
    monthlyViews: Infinity
  },
  {
    id: "PRO_LIFETIME",
    name: "Pro Lifetime",
    description: "For committed professionals",
    planType: "PRO",
    billingCycle: "LIFETIME",
    features: [
      "Unlimited organizations",
      "Unlimited members",
      "Unlimited widgets",
      "Unlimited monthly views",
      "Advanced analytics",
      "Premium support",
      "Custom branding",
      "API access",
      "Advanced integrations",
      "One-time payment",
      "Lifetime access"
    ],
    price: 999,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_LIFETIME_PRICE_ID,
    cta: "Get Lifetime Access",
    ctaSubtitle: "One-time payment",
    maxMembers: Infinity,
    maxWidgets: Infinity,
    monthlyViews: Infinity
  },
];
