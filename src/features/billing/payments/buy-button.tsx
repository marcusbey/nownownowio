"use client";

import { isActionSuccessful } from "@/lib/actions/actions-utils";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ButtonProps } from "@/components/core/button";
import { LoadingButton } from "@/features/ui/form/submit-button";
import { buyButtonAction, checkoutPlanAction } from "./buy-button.action";
import { BillingCycle, PlanType } from "@/features/billing/plans/plans";
import { logger } from "@/lib/logger";

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

  // Validate that we have either priceId OR (planType AND billingCycle)
  if (!priceId && (!planType || !billingCycle)) {
    logger.error("BuyButton requires either priceId or both planType and billingCycle");
  }

  const mutation = useMutation({
    mutationFn: async () => {
      try {
        if (session.status !== "authenticated") {
          router.push("/auth/signin");
          throw new Error("You must be authenticated to buy a plan");
        }

        let result;
        
        // Determine which checkout method to use
        if (priceId) {
          // Legacy mode: direct price ID checkout
          result = await buyButtonAction({
            priceId,
            orgSlug,
          });
        } else if (planType && billingCycle) {
          // New mode: plan-based checkout
          result = await checkoutPlanAction({
            planType,
            billingCycle,
            orgSlug,
          });
        } else {
          throw new Error("Invalid checkout parameters");
        }

        if (!isActionSuccessful(result)) {
          throw new Error(result?.serverError ?? "Failed to create checkout session");
        }

        if (!result.data?.url) {
          throw new Error("No checkout URL returned from Stripe");
        }

        return result.data.url;
      } catch (error) {
        logger.error("BuyButton error:", error);
        throw error;
      }
    },
    onSuccess: (url) => {
      router.push(url);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    }
  });

  return (
    <LoadingButton
      onClick={() => mutation.mutate()}
      {...props}
      loading={mutation.isPending}
      disabled={session.status === "loading"}
    />
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
