'use server'

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { createStripeCheckoutSession } from "@/lib/stripe";
import { redirect } from "next/navigation";
import { createStripeCustomer } from "./customer.action";

export async function createCheckoutSession(priceId: string, orgSlug: string) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Not authenticated");
  }

  // Get user's organization
  const userOrg = await prisma.organizationMembership.findFirst({
    where: {
      userId: session.user.id,
      roles: {
        has: "OWNER"
      }
    },
    include: {
      organization: true
    }
  });

  if (!userOrg) {
    throw new Error("No organization found");
  }

  const { organization } = userOrg;

  // Create or get Stripe customer
  let { stripeCustomerId } = organization;
  
  if (!stripeCustomerId) {
    stripeCustomerId = await createStripeCustomer(organization.id);
  }

  // Create Stripe checkout session
  const checkoutSession = await createStripeCheckoutSession({
    priceId,
    customerId: stripeCustomerId,
    origin: process.env.NEXT_PUBLIC_APP_URL!,
    orgSlug,
    orgId: organization.id,
  });

  if (!checkoutSession.url) {
    throw new Error("Failed to create checkout session");
  }

  redirect(checkoutSession.url);
}
