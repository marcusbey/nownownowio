export type Plan = {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  yearlyPrice?: number;
  currency: string;
  features: string[];
  isPopular?: boolean;
  type: "recurring" | "lifetime";
  interval?: "month" | "year";
  className?: string;
  priceId: string;
  yearlyPriceId?: string;
  cta: string;
  ctaSubtitle: string;
  savings?: string;
};

export const PLANS = [
  {
    id: "PRO",
    name: "Pro",
    subtitle: "Perfect for content creators",
    price: 14,
    yearlyPrice: 129,
    currency: "USD",
    features: [
      "Unlimited users",
      "Advanced widget customization",
      "Priority support",
      "Advanced analytics",
      "Custom branding",
      "API access",
      "Webhooks integration"
    ],
    isPopular: true,
    type: "recurring",
    interval: "month",
    priceId: "price_1QjQJS00GvYcfU0MA4GzNyp6",
    yearlyPriceId: "price_1Qji9P00GvYcfU0MR1g0gItW",
    cta: "Get Started",
    ctaSubtitle: "Billed monthly",
    savings: "Save 23%",
  },
  {
    id: "LIFETIME",
    name: "Lifetime",
    subtitle: "One-time payment, forever access",
    price: 199,
    currency: "USD",
    features: [
      "Everything in Pro",
      "Lifetime updates",
      "No recurring bills",
      "Priority feature requests",
      "Early access to new features",
      "Dedicated support",
      "Custom development hours"
    ],
    isPopular: false,
    type: "lifetime",
    priceId: "price_1QjQJb00GvYcfU0MoBCU9kiy",
    cta: "Get Lifetime Access",
    ctaSubtitle: "One-time payment",
    className: "border-primary",
  }
] satisfies Plan[];
