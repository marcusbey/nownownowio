import { env } from "@/lib/env";
import { getStripeInstance } from "@/lib/stripe";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/helper";

export async function POST(req: Request) {
  try {
    const user = await auth();
    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { organizationId } = await req.json();

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      return new Response("Organization not found", { status: 404 });
    }

    if (!organization.stripeCustomerId) {
      return new Response("No Stripe customer found", { status: 400 });
    }

    // Create Stripe billing portal session
    const stripe = await getStripeInstance();
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: organization.stripeCustomerId,
      return_url: `${env.NEXT_PUBLIC_BASE_URL}/orgs/${organization.slug}/settings/billing`,
    });

    return new Response(JSON.stringify({ url: portalSession.url }));
  } catch (error) {
    logger.error("Stripe portal error:", { error });
    return new Response("Internal server error", { status: 500 });
  }
}
