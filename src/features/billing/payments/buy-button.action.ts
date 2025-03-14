"use server";

import { createSearchParamsMessageUrl } from "@/features/ui/searchparams-message/createSearchParamsMessageUrl";
import { ActionError, action } from "@/lib/actions/safe-actions";
import { auth } from "@/lib/auth/helper";
import { prisma } from "@/lib/prisma";
import { getServerUrl } from "@/lib/server-url";
import { createCheckoutSession, getPriceIdByPlan, retrievePrice } from "@/lib/stripe";
import type { BillingCycle, PlanType } from "@/features/billing/plans/plans";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { FALLBACK_PRICES } from "@/features/billing/plans/fallback-prices";

// Schema for direct price ID checkout
const BuyButtonSchema = z.object({
  priceId: z.string(),
  orgSlug: z.string(),
});

// Schema for plan-based checkout
const PlanCheckoutSchema = z.object({
  planType: z.enum(["FREE", "BASIC", "PRO"]),
  billingCycle: z.enum(["MONTHLY", "ANNUAL", "LIFETIME"]),
  orgSlug: z.string(),
});

export const buyButtonAction = action
  .schema(BuyButtonSchema)
  .action(async ({ parsedInput: { priceId, orgSlug } }) => {
    try {
      const user = await auth();

      if (!user) {
        logger.warn("Authentication required for checkout");
        throw new ActionError("You must be authenticated to buy a plan");
      }

      const org = await prisma.organization.findFirst({
        where: {
          slug: orgSlug,
          members: {
            some: {
              userId: user.id,
              roles: { has: "OWNER" },
            },
          },
        },
      });

      if (!org) {
        logger.warn("Organization not found or user doesn't have permission", { orgSlug, userId: user.id });
        throw new ActionError("Organization not found or you don't have permission");
      }

      // Create or get Stripe customer ID
      const stripeCustomerId = org.stripeCustomerId;
      if (!stripeCustomerId) {
        logger.warn("Organization is not set up for billing", { orgId: org.id });
        throw new ActionError(
          "Organization is not set up for billing. Please contact support."
        );
      }

      // Get price details from Stripe
      let price;
      try {
        price = await retrievePrice(priceId);
        if (!price) {
          throw new Error("Price not found");
        }
      } catch (error) {
        logger.error("Failed to retrieve price from Stripe", { priceId, error });
        throw new ActionError("Invalid price ID or unable to retrieve price information");
      }
      
      const priceType = price.type;

      // Extract plan metadata from price if available
      const planType = price.metadata.planType as PlanType | undefined;
      const billingCycle = price.metadata.billingCycle as BillingCycle | undefined;
      
      logger.info("Processing checkout with price", { 
        priceId, 
        priceType, 
        planType, 
        billingCycle,
        orgId: org.id 
      });

      // Create checkout session
      const session = await createCheckoutSession({
        customer: stripeCustomerId,
        mode: priceType === "one_time" ? "payment" : "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        metadata: {
          userId: user.id,
          organizationId: org.id,
          planType: planType || null,
          billingCycle: billingCycle || null,
          priceId,
        },
        success_url: createSearchParamsMessageUrl(
          `${getServerUrl()}/orgs/${orgSlug}/settings/plan?session_id={CHECKOUT_SESSION_ID}`,
          "Your payment has been successful",
          "success"
        ),
        cancel_url: createSearchParamsMessageUrl(
          `${getServerUrl()}/orgs/${orgSlug}/settings/billing`,
          "Your payment has been cancelled",
          "error"
        ),
      });

      if (!session.url) {
        logger.error("Failed to create checkout session URL");
        throw new ActionError("Something went wrong while creating the checkout session.");
      }

      logger.info("Checkout session created successfully", { sessionId: session.id });
      return { url: session.url };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('BuyButton action error:', { error: errorMessage });
      throw error instanceof ActionError ? error : new ActionError('Failed to create checkout session. Please try again later.');
    }
  });

// New action for plan-based checkout
export const checkoutPlanAction = action
  .schema(PlanCheckoutSchema)
  .action(async ({ parsedInput: { planType, billingCycle, orgSlug } }) => {
    try {
      const user = await auth();

      if (!user) {
        logger.warn("Authentication required for checkout");
        throw new ActionError("You must be authenticated to buy a plan");
      }

      // Get organization and validate ownership
      const org = await prisma.organization.findFirst({
        where: {
          slug: orgSlug,
          members: {
            some: {
              userId: user.id,
              roles: { has: "OWNER" },
            },
          },
        },
      });

      if (!org) {
        logger.warn("Organization not found or user doesn't have permission", { orgSlug, userId: user.id });
        throw new ActionError("Organization not found or you don't have permission");
      }

      // Create or get Stripe customer ID
      const stripeCustomerId = org.stripeCustomerId;
      if (!stripeCustomerId) {
        logger.warn("Organization is not set up for billing", { orgId: org.id });
        throw new ActionError(
          "Organization is not set up for billing. Please contact support."
        );
      }

      // Get price ID for the selected plan
      let priceId: string;
      try {
        priceId = await getPriceIdByPlan(planType, billingCycle);
        
        // If no price ID is found, try to get a fallback price ID
        if (!priceId) {
          logger.warn("Price ID not found from getPriceIdByPlan, checking fallbacks", { planType, billingCycle });
          
          // Access fallback prices safely with proper type assertions
          const planKey = planType as keyof typeof FALLBACK_PRICES;
          const cycleKey = billingCycle as keyof typeof FALLBACK_PRICES.BASIC;
          
          // Safely access the fallback prices
          const planPrices = FALLBACK_PRICES[planKey];
          if (planPrices) {
            const cyclePricing = planPrices[cycleKey as keyof typeof planPrices];
            if (cyclePricing && cyclePricing.priceId) {
              priceId = cyclePricing.priceId;
              logger.info("Using fallback price ID", { priceId, planType, billingCycle });
            }
          }
          
          if (!priceId) {
            throw new Error("No price ID found in fallbacks");
          }
        }
      } catch (error) {
        logger.error("Failed to get price ID", { planType, billingCycle, error });
        throw new ActionError(`Price not found for ${planType} ${billingCycle} plan. Please contact support.`);
      }
      
      logger.info("Processing checkout with plan", { 
        planType, 
        billingCycle, 
        priceId,
        orgId: org.id 
      });

      // Create checkout session
      const session = await createCheckoutSession({
        customer: stripeCustomerId,
        mode: billingCycle === "LIFETIME" ? "payment" : "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        metadata: {
          userId: user.id,
          organizationId: org.id,
          planType: planType || null,
          billingCycle: billingCycle || null,
          priceId,
        },
        success_url: createSearchParamsMessageUrl(
          `${getServerUrl()}/orgs/${orgSlug}/settings/plan?session_id={CHECKOUT_SESSION_ID}`,
          "Your payment has been successful",
          "success"
        ),
        cancel_url: createSearchParamsMessageUrl(
          `${getServerUrl()}/orgs/${orgSlug}/settings/billing`,
          "Your payment has been cancelled",
          "error"
        ),
      });

      if (!session.url) {
        logger.error("Failed to create checkout session URL");
        throw new ActionError("Something went wrong while creating the checkout session.");
      }

      logger.info("Checkout session created successfully", { sessionId: session.id });
      return { url: session.url };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Checkout plan action error:', { error: errorMessage });
      throw error instanceof ActionError ? error : new ActionError('Failed to create checkout session. Please try again later.');
    }
  });