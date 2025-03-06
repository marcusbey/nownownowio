import { z } from "zod";

// Define plan types and billing cycles
export const PlanType = z.enum(["BASIC", "PRO"]);
export type PlanType = z.infer<typeof PlanType>;

export const BillingCycle = z.enum(["MONTHLY", "ANNUAL", "LIFETIME"]);
export type BillingCycle = z.infer<typeof BillingCycle>;

export const PlanId = z.enum([
  "BASIC_MONTHLY", "BASIC_ANNUAL", "BASIC_LIFETIME", 
  "PRO_MONTHLY", "PRO_ANNUAL", "PRO_LIFETIME"
]);
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
    planType: "BASIC",
    billingCycle: "MONTHLY",
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
    planType: "BASIC",
    billingCycle: "ANNUAL",
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
    planType: "BASIC",
    billingCycle: "LIFETIME",
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
    planType: "PRO",
    billingCycle: "MONTHLY",
    features: [
      "5 organizations/projects",
      "5 widgets (1 per organization)",
      "Each widget can be embedded on multiple websites",
      "Optional \"Powered by NowNowNow\" branding",
      "Unlimited posts for each organization",
      "Unlimited widget views",
      "Full post management",
      "Up to 5 team members",
      "Custom domain support",
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
    planType: "PRO",
    billingCycle: "ANNUAL",
    features: [
      "5 organizations/projects",
      "5 widgets (1 per organization)",
      "Each widget can be embedded on multiple websites",
      "Optional \"Powered by NowNowNow\" branding",
      "Unlimited posts for each organization",
      "Unlimited widget views",
      "Full post management",
      "Up to 5 team members",
      "Custom domain support",
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
    planType: "PRO",
    billingCycle: "LIFETIME",
    features: [
      "5 organizations/projects",
      "5 widgets (1 per organization)",
      "Each widget can be embedded on multiple websites",
      "Optional \"Powered by NowNowNow\" branding",
      "Unlimited posts for each organization",
      "Unlimited widget views",
      "Full post management",
      "Up to 5 team members",
      "Custom domain support",
      "User chat functionality",
      "Advanced analytics dashboard",
      "Priority support",
      "Priority access to new features",
      "One-time payment",
      "Lifetime access",
      "All future updates included"
    ],
    price: 399,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_LIFETIME_PRICE_ID,
    cta: "Buy Lifetime Access",
    ctaSubtitle: "One-time payment of $399",
    isPopular: true,
    maxOrganizations: 5,
    maxMembers: 5,
    maxWidgets: 5,
    monthlyViews: -1, // Unlimited
    hasBranding: false
  },
];
