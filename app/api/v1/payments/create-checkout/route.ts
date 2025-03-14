import { env } from "@/lib/env";
import { createCheckoutSession, createCustomer, getPriceIdByPlan } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/helper";
import { FALLBACK_PRICES } from "@/features/billing/plans/fallback-prices";
import { logger } from "@/lib/logger";

type Interval = "month" | "year";

// Helper function to get fallback amount with proper type safety
function getFallbackAmount(planType: string, billingCycle: string): number {
  try {
    // Get the plan from FALLBACK_PRICES
    const planKey = planType as keyof typeof FALLBACK_PRICES;
    const plan = FALLBACK_PRICES[planKey];
    
    // We're asserting planKey as a valid key, but we should still handle the case
    // where the plan might not exist at runtime for better error messages
    if (!plan) {
      // This condition might be unreachable with proper type assertions, but keeping it for runtime safety
      throw new Error(`Plan ${planType} not found in FALLBACK_PRICES`);
    }
    
    // Get the cycle from the plan
    const cycleKey = billingCycle as keyof typeof plan;
    const cycle = plan[cycleKey] as { amount: number; priceId: string } | undefined;
    
    // Check if cycle exists and has a valid amount
    if (!cycle || typeof cycle.amount !== 'number') {
      throw new Error(`Cycle ${billingCycle} not found in plan ${planType} or amount is not a number`);
    }
    
    return cycle.amount * 100;
  } catch (error) {
    // If anything goes wrong, use hardcoded values
    logger.warn("Using hardcoded fallback prices", { error: error instanceof Error ? error.message : String(error) });
    
    // Default fallback values
    if (planType === "BASIC") {
      if (billingCycle === "MONTHLY") return 999;
      if (billingCycle === "YEARLY") return 9999;
      return 19999; // LIFETIME
    } else {
      // PRO plan
      if (billingCycle === "MONTHLY") return 1999;
      if (billingCycle === "YEARLY") return 19999;
      return 39999; // LIFETIME
    }
  }
}

export async function POST(req: Request) {
  try {
    const user = await auth();
    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { organizationId, planId } = await req.json();

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      return new Response("Organization not found", { status: 404 });
    }

    // Extract plan type and billing cycle from the plan ID
    const [planType, billingCycle] = planId.split("_");

    // Create or retrieve Stripe customer
    let customerId = organization.stripeCustomerId;
    if (!customerId) {
      const customer = await createCustomer({
        email: organization.email ?? undefined,
        metadata: {
          organizationId: organization.id,
        },
      });
      customerId = customer.id;

      await prisma.organization.update({
        where: { id: organization.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Determine if we're using live or test mode
    const useLiveMode = env.USE_LIVE_MODE === 'true';
    logger.info(`Using ${useLiveMode ? 'live' : 'test'} mode for Stripe checkout`);

    // Get the price ID based on the plan type and billing cycle
    const priceId = await getPriceIdByPlan(planType, billingCycle);
    
    // Define the line item based on whether we have a price ID
    const lineItem = priceId ? 
      {
        price: priceId,
        quantity: 1,
      } : 
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${planType.charAt(0).toUpperCase() + planType.slice(1).toLowerCase()} Plan - ${billingCycle.toLowerCase()}`,
            description: `${planType} plan with ${billingCycle.toLowerCase()} billing`,
          },
          // Get the amount from FALLBACK_PRICES or use hardcoded values as a last resort
          unit_amount: getFallbackAmount(planType, billingCycle),
          recurring: billingCycle === "LIFETIME" ? undefined : {
            interval: (billingCycle === "MONTHLY" ? "month" : "year") as Interval,
          },
        },
        quantity: 1,
      };
    
    // Create Stripe checkout session
    const checkoutSession = await createCheckoutSession({
      customer: customerId,
      mode: billingCycle === "LIFETIME" ? "payment" : "subscription",
      payment_method_types: ["card"],
      line_items: [lineItem],
      success_url: `${env.NEXT_PUBLIC_BASE_URL}/orgs/${organization.slug}/settings?checkout_success=true`,
      cancel_url: `${env.NEXT_PUBLIC_BASE_URL}/orgs/${organization.slug}/settings?checkout_canceled=true`,
      metadata: {
        organizationId: organization.id,
        planId: planId,
        userId: user.id,
      },
    });

    return new Response(JSON.stringify({ url: checkoutSession.url }));
  } catch (error) {
    // Log error but don't expose details in response
    logger.error("Stripe checkout error", { error: error instanceof Error ? error.message : String(error) });
    
    // Provide a more specific error message for debugging while maintaining security
    const errorMessage = error instanceof Error ? 
      `Failed to create checkout session: ${error.message}` : 
      "Failed to create checkout session";
    
    return new Response(JSON.stringify({ error: "Failed to create checkout session" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
