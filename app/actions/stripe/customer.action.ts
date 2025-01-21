'use server'

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getStripeInstance } from "@/lib/stripe";

export async function createStripeCustomer(organizationId: string) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Not authenticated");
  }

  // Get the organization
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  // Create Stripe customer if not exists
  if (!organization.stripeCustomerId) {
    const stripe = await getStripeInstance();
    const customer = await stripe.customers.create({
      email: organization.email || session.user.email,
      name: organization.name,
      metadata: {
        organizationId: organization.id,
      },
    });

    // Update organization with Stripe customer ID
    await prisma.organization.update({
      where: { id: organization.id },
      data: { stripeCustomerId: customer.id },
    });

    return customer.id;
  }

  return organization.stripeCustomerId;
}
