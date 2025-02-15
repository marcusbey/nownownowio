import { prisma } from "@/lib/prisma";
import { createCustomer } from "@/lib/stripe";
import type { Prisma } from "@prisma/client";

export const createOrganizationQuery = async (
  params: Prisma.OrganizationUncheckedCreateInput,
) => {
  const customer = await createCustomer({
    email: params.email,
    name: params.name,
  });

  const organization = await prisma.organization.create({
    data: {
      ...params,
      planId: "FREEBIRD_RECURRING",
      stripeCustomerId: customer.id,
    },
  });

  return organization;
};
