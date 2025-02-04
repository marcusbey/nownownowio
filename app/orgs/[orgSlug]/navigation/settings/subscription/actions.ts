"use server";

import { z } from "zod";
import { getStripeInstance } from "@/lib/stripe";
import { getServerUrl } from "@/lib/server-url";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/helper";
import { revalidatePath } from "next/cache";

export async function updateSubscription(
  orgId: string,
  priceId: string,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const organization = await prisma.organization.findFirst({
      where: { id: orgId },
      include: {
        plan: true,
      },
    });

    if (!organization) {
      throw new Error("Organization not found");
    }

    let customerId = organization.stripeCustomerId;
    const stripe = await getStripeInstance();

    // If no customer ID exists, create a new customer
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

    // Create a checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${getServerUrl()}/orgs/${organization.slug}/settings/subscription?success=true`,
      cancel_url: `${getServerUrl()}/orgs/${organization.slug}/settings/subscription?canceled=true`,
      allow_promotion_codes: true,
    });

    revalidatePath(`/orgs/${organization.slug}/settings/subscription`);

    return { url: checkoutSession.url };
  } catch (error) {
    console.error("Error updating subscription:", error);
    throw error;
  }
}

export async function manageBilling(orgId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const organization = await prisma.organization.findFirst({
      where: { id: orgId },
    });

    if (!organization) {
      throw new Error("Organization not found");
    }

    if (!organization.stripeCustomerId) {
      throw new Error("No billing information found");
    }

    const stripe = await getStripeInstance();
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: organization.stripeCustomerId,
      return_url: `${getServerUrl()}/orgs/${organization.slug}/settings/subscription`,
    });

    return { url: portalSession.url };
  } catch (error) {
    console.error("Error managing billing:", error);
    throw error;
  }
}
