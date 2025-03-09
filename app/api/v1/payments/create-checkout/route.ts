import { env } from "@/lib/env";
import { createCheckoutSession, createCustomer } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/helper";

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
        email: organization.email || undefined,
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

    // Create Stripe checkout session
    const checkoutSession = await createCheckoutSession({
      customer: customerId,
      mode: billingCycle === "LIFETIME" ? "payment" : "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          // We'll dynamically get the price ID based on the plan type and billing cycle
          price_data: {
            currency: "usd",
            product_data: {
              name: `${planType.charAt(0).toUpperCase() + planType.slice(1).toLowerCase()} Plan - ${billingCycle.toLowerCase()}`,
              description: `${planType} plan with ${billingCycle.toLowerCase()} billing`,
            },
            unit_amount: planType === "BASIC" ? (billingCycle === "MONTHLY" ? 999 : 9999) : (billingCycle === "MONTHLY" ? 1999 : 19999),
            recurring: billingCycle === "LIFETIME" ? undefined : {
              interval: billingCycle === "MONTHLY" ? "month" : "year",
            },
          },
          quantity: 1,
        },
      ],
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
    console.error("Stripe checkout error:", error);
    return new Response(JSON.stringify({ error: "Failed to create checkout session" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
