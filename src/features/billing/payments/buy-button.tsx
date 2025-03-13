"use client";

import { isActionSuccessful } from "@/lib/actions/actions-utils";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ButtonProps } from "@/components/core/button";
import { Button } from "@/components/core/button";
import { buyButtonAction, checkoutPlanAction } from "./buy-button.action";
import type { BillingCycle, PlanType } from "@/features/billing/plans/plans";
import { logger } from "@/lib/logger";
import { usePlanPricing } from "@/features/billing/plans/plan-pricing-context";

// Props for direct price ID checkout
type BuyButtonProps = {
  priceId?: string;
  orgSlug: string;
  planType?: PlanType;
  billingCycle?: BillingCycle;
} & ButtonProps;

/**
 * This is a button that will create a Stripe checkout session and redirect the user to the checkout page
 * It supports two modes of operation:
 * 1. Direct price ID checkout (legacy mode)
 * 2. Plan-based checkout using planType and billingCycle
 *
 * @example
 * ```tsx
 * // Legacy mode with direct price ID
 * <BuyButton priceId="price_123" orgSlug="my-org">Buy now!</BuyButton>
 * 
 * // New mode with plan type and billing cycle
 * <BuyButton planType="BASIC" billingCycle="MONTHLY" orgSlug="my-org">Subscribe</BuyButton>
 * ```
 *
 * @param props Button props and checkout parameters
 * @returns A button component that initiates the checkout process
 */
export const BuyButton = ({ 
  priceId, 
  orgSlug, 
  planType, 
  billingCycle, 
  ...props 
}: BuyButtonProps) => {
  const router = useRouter();
  const session = useSession();
  const { getPriceId: getPriceIdFromContext } = usePlanPricing();

  // Validate that we have either priceId OR (planType AND billingCycle)
  if (!priceId && (!planType || !billingCycle)) {
    logger.error("BuyButton requires either priceId or both planType and billingCycle");
  }
  
  // Get price ID from context if not provided directly
  const getEffectivePriceId = (): string | undefined => {
    // If priceId is explicitly provided, use it
    if (priceId) return priceId;
    
    // If we have planType and billingCycle, try to get from context
    if (planType && billingCycle && getPriceIdFromContext) {
      // Get from context
      const contextPriceId = getPriceIdFromContext(planType, billingCycle);
      if (contextPriceId) return contextPriceId;
    }
    
    // Return undefined if we couldn't determine a price ID
    return undefined;
  };

  const mutation = useMutation({
    mutationFn: async () => {
      try {
        if (session.status !== "authenticated") {
          router.push("/auth/signin");
          throw new Error("You must be authenticated to buy a plan");
        }

        let result;
        const effectivePriceId = getEffectivePriceId();
        
        // Log checkout attempt for debugging
        logger.info("Initiating checkout", { 
          priceId: effectivePriceId, 
          planType, 
          billingCycle, 
          orgSlug 
        });
        
        // Determine which checkout method to use
        if (effectivePriceId) {
          // Direct price ID checkout if we have a price ID
          result = await buyButtonAction({
            priceId: effectivePriceId,
            orgSlug,
          });
        } else if (planType && billingCycle) {
          // Plan-based checkout if we have plan type and billing cycle
          result = await checkoutPlanAction({
            planType,
            billingCycle,
            orgSlug,
          });
        } else {
          throw new Error("Invalid checkout parameters: missing price ID or plan details");
        }

        if (!isActionSuccessful(result)) {
          throw new Error(result && result.serverError ? result.serverError : "Failed to create checkout session");
        }

        if (!result.data || !result.data.url) {
          throw new Error("No checkout URL returned from Stripe");
        }

        return result.data.url;
      } catch (error) {
        logger.error("BuyButton error:", error);
        throw error;
      }
    },
    onSuccess: (url) => {
      // Direct window location change instead of using router.push
      // This ensures we properly redirect to external Stripe checkout URL
      window.location.href = url;
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    }
  });

  return (
    <Button
      onClick={() => mutation.mutate()}
      {...props}
      disabled={session.status === "loading" || mutation.isPending}
    >
      {mutation.isPending ? "Processing..." : props.children}
    </Button>
  );
};

/**
 * A specialized buy button that uses plan type and billing cycle
 */
export const PlanBuyButton = ({ 
  planType, 
  billingCycle, 
  orgSlug, 
  ...props 
}: Omit<BuyButtonProps, 'priceId'> & {
  planType: PlanType;
  billingCycle: BillingCycle;
}) => {
  return (
    <BuyButton
      planType={planType}
      billingCycle={billingCycle}
      orgSlug={orgSlug}
      {...props}
    />
  );
};
