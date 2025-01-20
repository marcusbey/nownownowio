import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { Prisma } from "@prisma/client";

export const createOrganizationQuery = async (
  params: Prisma.OrganizationUncheckedCreateInput,
) => {
  //console.log("Received params:", params);

  const organization = await prisma.organization.create({
    data: {
      ...params,
      planId: 'FREE',
    },
  });

  const customer = await stripe.customers.create({
    email: params.email || undefined,
    metadata: {
      orgId: organization.id,
    },
  });

  //console.log("Created Stripe customer:", customer.id);

  // Check if the FREE plan exists, if not, create it
  const freePlan = await prisma.organizationPlan.upsert({
    where: { id: 'FREE' },
    update: {},
    create: {
      id: 'FREE',
      name: 'FREE',
      maximumMembers: 1,
    },
  });

  await prisma.organization.update({
    where: { id: organization.id },
    data: {
      planId: freePlan.id,
      stripeCustomerId: customer.id,
    },
  });

  //console.log("Created organization:", organization);

  return organization;
};
