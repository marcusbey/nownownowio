import { z } from "zod";

export const PlanId = z.enum(["FREEBIRD_RECURRING", "FREEBIRD_LIFETIME"]);
export type PlanId = z.infer<typeof PlanId>;

export interface Plan {
  id: string;
  name: string;
  description: string;
  subtitle?: string;
  features: string[];
  price?: number;
  yearlyPrice?: number;
  priceId?: string;
  yearlyPriceId?: string;
  type: "recurring" | "lifetime";
  isPopular?: boolean;
  className?: string;
  currency?: string;
}

export const PLANS: Plan[] = [
  {
    id: "FREEBIRD_RECURRING",
    name: "Free Bird",
    description: "For solopreneurs who want flexibility",
    features: [
      "1 organization member",
      "Advanced analytics",
      "Priority support",
      "All features included",
      "Monthly or yearly billing",
    ],
    type: "recurring",
    price: 14, // Monthly price
    yearlyPrice: 129, // Yearly price
    priceId: "price_1QjQJS00GvYcfU0MA4GzNyp6", // Monthly price ID
    yearlyPriceId: "price_1Qji9P00GvYcfU0MR1g0gItW", // Yearly price ID
  },
  {
    id: "FREEBIRD_LIFETIME",
    name: "Free Bird Lifetime",
    description: "For solopreneurs who want lifetime access",
    features: [
      "1 organization member",
      "Advanced analytics",
      "Priority support",
      "All features included",
      "One-time payment",
      "Lifetime access",
    ],
    type: "lifetime",
    price: 199,
    priceId: "price_1QjQJb00GvYcfU0MoBCU9kiy", // Live one-time price
  },
];
