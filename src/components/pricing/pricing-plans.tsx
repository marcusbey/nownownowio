"use client";

import { PricingCards } from "@/features/billing/plans/pricing-section";

type PricingProps = {
  userId?: string;
  userEmail?: string;
  organizationId?: string;
  currentPlanId?: string;
}

/**
 * PricingPlans component that renders the pricing cards
 * This is a simplified wrapper around the PricingCards component
 * from the features/billing/plans directory
 */
export function PricingPlans({
  userId,
  userEmail,
  organizationId,
  currentPlanId,
}: PricingProps) {
  return <PricingCards />;
}


