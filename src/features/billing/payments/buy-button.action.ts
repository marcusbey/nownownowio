"use server";

import { createSearchParamsMessageUrl } from "@/features/ui/searchparams-message/createSearchParamsMessageUrl";
import { ActionError, action } from "@/lib/actions/safe-actions";
import { auth } from "@/lib/auth/helper";
import { prisma } from "@/lib/prisma";
import { getServerUrl } from "@/lib/server-url";
import { createCheckoutSession, getPriceIdByPlan, retrievePrice } from "@/lib/stripe";
import { BillingCycle, PlanType } from "@/features/billing/plans/plans";
import { z } from "zod";
import { logger } from "@/lib/logger";

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
        throw new ActionError("You must be authenticated to buy a plan");
      }

      const org = await prisma.organization.findFirst({
        where: {
          slug: orgSlug,
          members: {
            some: {
              userId: user.id,
              role: "OWNER", // Updated to match the schema
            },
          },
        },
      });

      if (!org) {
        throw new ActionError("Organization not found or you don't have permission");
      }

      // Create or get Stripe customer ID
      let stripeCustomerId = org.stripeCustomerId;
      if (!stripeCustomerId) {
        // This would typically be handled by a separate function to create a customer
        // For now, we'll throw an error
        throw new ActionError(
          "Organization is not set up for billing. Please contact support."
        );
      }

      // Get price details from Stripe
      const price = await retrievePrice(priceId);
      if (!price) {
        throw new ActionError("Invalid price ID");
      }
      const priceType = price.type;

      // Extract plan metadata from price if available
      const planType = price.metadata?.planType as PlanType | undefined;
      const billingCycle = price.metadata?.billingCycle as BillingCycle | undefined;

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
          planType,
          billingCycle,
        },
        success_url: createSearchParamsMessageUrl(
          `${getServerUrl()}/orgs/${orgSlug}/settings/billing?session_id={CHECKOUT_SESSION_ID}`,
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
        throw new ActionError("Something went wrong while creating the session.");
      }

      return { url: session.url };
    } catch (error) {
      logger.error('BuyButton action error:', error);
      throw error instanceof ActionError ? error : new ActionError('Failed to create checkout session');
    }
  });

// New action for plan-based checkout
export const checkoutPlanAction = action
  .schema(PlanCheckoutSchema)
  .action(async ({ parsedInput: { planType, billingCycle, orgSlug } }) => {
    try {
      const user = await auth();

      if (!user) {
        throw new ActionError("You must be authenticated to buy a plan");
      }

      // Get organization and validate ownership
      const org = await prisma.organization.findFirst({
        where: {
          slug: orgSlug,
          members: {
            some: {
              userId: user.id,
              role: "OWNER", // Updated to match the schema
            },
          },
        },
      });

      if (!org) {
        throw new ActionError("Organization not found or you don't have permission");
      }

      // Create or get Stripe customer ID
      let stripeCustomerId = org.stripeCustomerId;
      if (!stripeCustomerId) {
        // This would typically be handled by a separate function to create a customer
        // For now, we'll throw an error
        throw new ActionError(
          "Organization is not set up for billing. Please contact support."
        );
      }

      // Get price ID for the selected plan
      let priceId: string;
      try {
        priceId = getPriceIdByPlan(planType, billingCycle);
      } catch (error) {
        throw new ActionError(`Price not found for ${planType} ${billingCycle} plan`);
      }

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
          planType,
          billingCycle,
        },
        success_url: createSearchParamsMessageUrl(
          `${getServerUrl()}/orgs/${orgSlug}/settings/billing?session_id={CHECKOUT_SESSION_ID}`,
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
        throw new ActionError("Something went wrong while creating the session.");
      }

      return { url: session.url };
    } catch (error) {
      logger.error('Checkout plan action error:', error);
      throw error instanceof ActionError ? error : new ActionError('Failed to create checkout session');
    }
  });