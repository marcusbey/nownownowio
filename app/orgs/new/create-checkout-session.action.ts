"use server";

import { authAction } from "@/lib/actions/safe-actions";
import { createCheckoutSession, getPriceIdByPlan } from "@/lib/stripe";
import { z } from "zod";
import { env } from "@/lib/env";

// Schema for the checkout session creation
const CheckoutSessionSchema = z.object({
  planId: z.string(),
  organizationId: z.string(),
  organizationSlug: z.string(),
});

export type CheckoutSessionSchemaType = z.infer<typeof CheckoutSessionSchema>;

export const createCheckoutSessionAction = authAction
  .schema(CheckoutSessionSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      // Extract plan type and billing cycle from the plan ID
      const [planType, billingCycle] = parsedInput.planId.split("_");
      
      // Get the Stripe price ID for the selected plan
      const priceId = await getPriceIdByPlan(planType, billingCycle);
      
      // Create a checkout session
      const session = await createCheckoutSession({
        mode: billingCycle === "LIFETIME" ? "payment" : "subscription",
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        customer_email: ctx.user.email,
        client_reference_id: parsedInput.organizationId,
        metadata: {
          organizationId: parsedInput.organizationId,
          organizationSlug: parsedInput.organizationSlug,
          planId: parsedInput.planId,
          userId: ctx.user.id,
        },
        success_url: `${env.NEXT_PUBLIC_BASE_URL}/orgs/${parsedInput.organizationSlug}/settings?checkout_success=true`,
        cancel_url: `${env.NEXT_PUBLIC_BASE_URL}/orgs/${parsedInput.organizationSlug}/settings?checkout_canceled=true`,
      });

      // Return the session URL
      return { url: session.url };
    } catch (error) {
      console.error("Error creating checkout session:", error);
      throw new Error("Failed to create checkout session");
    }
  });
