import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { organizationId } = await req.json();

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      return new Response("Organization not found", { status: 404 });
    }

    // Create or retrieve Stripe customer
    let customerId = organization.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
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
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${env.NEXT_PUBLIC_APP_URL}/orgs/${organization.slug}/settings/billing?success=true`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/orgs/${organization.slug}/settings/billing?canceled=true`,
      metadata: {
        organizationId: organization.id,
      },
    });

    return new Response(JSON.stringify({ url: checkoutSession.url }));
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
