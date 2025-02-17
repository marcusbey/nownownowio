import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";

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

    if (!organization.stripeCustomerId) {
      return new Response("No Stripe customer found", { status: 400 });
    }

    // Create Stripe billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: organization.stripeCustomerId,
      return_url: `${env.NEXT_PUBLIC_APP_URL}/orgs/${organization.slug}/settings/billing`,
    });

    return new Response(JSON.stringify({ url: portalSession.url }));
  } catch (error) {
    console.error("Stripe portal error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
