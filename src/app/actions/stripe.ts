"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { env } from "@/lib/env";
import { createCheckoutSession, getCustomer, getPriceIdByPlan } from "@/lib/stripe";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { action } from "@/lib/safe-action";

// Schema for plan checkout
const checkoutSchema = z.object({
  planType: z.enum(["FREE", "BASIC", "PRO"]),
  billingCycle: z.enum(["MONTHLY", "ANNUAL", "LIFETIME"]),
  organizationId: z.string().optional(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

// Type for the checkout schema
type CheckoutInput = z.infer<typeof checkoutSchema>;

/**
 * Create a checkout session for a plan
 */
export const checkoutPlan = action(checkoutSchema, async (input: CheckoutInput) => {
  const session = await auth();
  const user = session?.user;

  if (!user || !user.id) {
    throw new Error("You must be logged in to checkout");
  }

  try {
    // Get the price ID for the selected plan
    const priceId = getPriceIdByPlan(input.planType, input.billingCycle);
    
    // Get or create customer
    let customerId: string;
    
    // Check if user has organization with Stripe customer ID
    let organization;
    if (input.organizationId) {
      organization = await db.organization.findUnique({
        where: { id: input.organizationId },
        select: { stripeCustomerId: true },
      });
      
      if (organization?.stripeCustomerId) {
        customerId = organization.stripeCustomerId;
      } else {
        // Create new customer for organization
        const customer = await getCustomer({
          email: user.email || undefined,
          name: user.name || undefined,
          metadata: {
            userId: user.id,
            organizationId: input.organizationId,
          },
        });
        
        customerId = customer.id;
        
        // Update organization with customer ID
        await db.organization.update({
          where: { id: input.organizationId },
          data: { stripeCustomerId: customerId },
        });
      }
    } else {
      // Personal plan for user
      // TODO: Implement user customer ID logic if needed
      const customer = await getCustomer({
        email: user.email || undefined,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
        },
      });
      
      customerId = customer.id;
    }
    
    // Create checkout session
    const checkoutSession = await createCheckoutSession({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: input.billingCycle === "LIFETIME" ? "payment" : "subscription",
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      metadata: {
        userId: user.id,
        organizationId: input.organizationId,
        planType: input.planType,
        billingCycle: input.billingCycle,
      },
    });
    
    if (!checkoutSession.url) {
      throw new Error("Failed to create checkout session");
    }
    
    // Revalidate paths
    if (input.organizationId) {
      revalidatePath(`/orgs/${input.organizationId}`);
    }
    revalidatePath("/account");
    
    return { checkoutUrl: checkoutSession.url };
  } catch (error) {
    console.error("Checkout error:", error);
    throw new Error("Failed to create checkout session");
  }
});

/**
 * Create a billing portal session for a customer
 */
export const createBillingPortal = action(
  z.object({
    organizationId: z.string().optional(),
    returnUrl: z.string().url(),
  }),
  async (input) => {
    const session = await auth();
    const user = session?.user;

    if (!user || !user.id) {
      throw new Error("You must be logged in to access billing portal");
    }

    try {
      // Get customer ID
      let customerId: string;
      
      if (input.organizationId) {
        // Get organization's customer ID
        const organization = await db.organization.findUnique({
          where: { id: input.organizationId },
          select: { stripeCustomerId: true },
        });
        
        if (!organization?.stripeCustomerId) {
          throw new Error("No billing information found for this organization");
        }
        
        customerId = organization.stripeCustomerId;
      } else {
        // TODO: Implement user customer ID logic if needed
        throw new Error("Organization ID is required");
      }
      
      // Create billing portal session
      const portalSession = await createBillingPortalSession({
        customer: customerId,
        return_url: input.returnUrl,
      });
      
      if (!portalSession.url) {
        throw new Error("Failed to create billing portal session");
      }
      
      return { url: portalSession.url };
    } catch (error) {
      console.error("Billing portal error:", error);
      throw new Error("Failed to create billing portal session");
    }
  }
);
