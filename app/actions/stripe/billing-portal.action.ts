'use server'

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getStripeInstance } from "@/lib/stripe";
import { redirect } from "next/navigation";

export async function createBillingPortalSession() {
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

  if (!userOrg?.organization.stripeCustomerId) {
    throw new Error("No billing information found");
  }

  const stripe = await getStripeInstance();
  
  // Create billing portal session
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: userOrg.organization.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/billing`,
  });

  if (!portalSession.url) {
    throw new Error("Failed to create billing portal session");
  }

  redirect(portalSession.url);
}
