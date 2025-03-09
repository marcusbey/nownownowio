import { prisma } from "@/lib/prisma";
import { createCustomer } from "@/lib/stripe";
import type { Prisma } from "@prisma/client";

export const createOrganizationQuery = async (
  params: Prisma.OrganizationUncheckedCreateInput & { 
    websiteUrl?: string | undefined;
    bio?: string | undefined;
    planId?: string;
    billingPeriod?: "MONTHLY" | "YEARLY" | "LIFETIME";
  },
) => {
  const customer = await createCustomer({
    email: params.email,
    name: params.name,
  });

  // Extract the plan ID and billing period from the combined format (e.g., "BASIC_MONTHLY")
  const planIdParts = (params.planId ?? "FREE_MONTHLY").split("_");
  const planType = planIdParts[0] ?? "FREE";
  // planIdParts[1] might be undefined if planId doesn't contain an underscore
  const billingPeriod = params.billingPeriod ?? planIdParts[1] ?? "MONTHLY";
  
  // Construct the actual plan ID for the database
  // Format: PLANTYPE_BILLINGTYPE (e.g., BASIC_RECURRING, PRO_LIFETIME)
  const dbPlanId = `${planType}_${billingPeriod === "LIFETIME" ? "LIFETIME" : "RECURRING"}`;

  const organization = await prisma.organization.create({
    data: {
      ...params,
      planId: dbPlanId,
      stripeCustomerId: customer.id,
      websiteUrl: params.websiteUrl === "" ? undefined : params.websiteUrl,
      bio: params.bio === "" ? undefined : params.bio,
    },
  });

  return organization;
};
