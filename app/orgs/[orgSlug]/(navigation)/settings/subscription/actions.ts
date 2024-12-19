"use server";

import { z } from "zod";
import { stripe } from "@/lib/stripe";
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
    if (!session?.id) {
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
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${getServerUrl()}/orgs/${organization.slug}/settings/subscription?success=true`,
      cancel_url: `${getServerUrl()}/orgs/${organization.slug}/settings/subscription?canceled=true`,
      metadata: {
        organizationId: organization.id,
      },
    });

    if (!checkoutSession.url) {
      throw new Error("Failed to create checkout session");
    }

    revalidatePath(`/orgs/${organization.slug}/settings/subscription`);
    return { url: checkoutSession.url };
  } catch (error) {
    console.error("Subscription error:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to update subscription");
  }
}

export async function manageBilling(orgId: string) {
  try {
    const session = await auth();
    if (!session?.id) {
      throw new Error("Unauthorized");
    }

    const organization = await prisma.organization.findFirst({
      where: { id: orgId },
    });

    if (!organization?.stripeCustomerId) {
      throw new Error("No billing information found");
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: organization.stripeCustomerId,
      return_url: `${getServerUrl()}/orgs/${organization.slug}/settings/subscription`,
    });

    revalidatePath(`/orgs/${organization.slug}/settings/subscription`);
    return { url: portalSession.url };
  } catch (error) {
    console.error("Billing portal error:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to access billing portal");
  }
}
