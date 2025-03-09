import { prisma } from "@/lib/prisma";
import { createCustomer } from "@/lib/stripe";
import type { Prisma } from "@prisma/client";

export const createOrganizationQuery = async (
  params: Prisma.OrganizationUncheckedCreateInput & { 
    websiteUrl?: string | undefined;
    bio?: string | undefined;
    planId: string;
    billingPeriod: "MONTHLY" | "YEARLY" | "LIFETIME";
  },
) => {
  const customer = await createCustomer({
    email: params.email as string,
    name: params.name as string,
  });

  // First, try to find the plan requested by the user
  let planId = params.planId;
  
  // Check if the requested plan exists
  let plan = await prisma.organizationPlan.findUnique({
    where: { id: planId }
  });
  
  // If the requested plan doesn't exist, find any available plan
  if (!plan) {
    // First try to find the FREE plan
    plan = await prisma.organizationPlan.findFirst({
      where: { type: "FREE" }
    });
    
    // If no FREE plan exists, find any plan
    if (!plan) {
      plan = await prisma.organizationPlan.findFirst();
      
      // If no plans exist at all, we can't proceed
      if (!plan) {
        throw new Error("No organization plans exist in the database. Please contact support.");
      }
    }
    
    // Use the found plan's ID
    planId = plan.id;
  }

  const organization = await prisma.organization.create({
    data: {
      slug: params.slug,
      name: params.name,
      email: params.email,
      websiteUrl: params.websiteUrl === "" ? undefined : params.websiteUrl,
      bio: params.bio === "" ? undefined : params.bio,
      stripeCustomerId: customer.id,
      members: params.members,
      planId: planId // Use the plan ID we found or created
    },
  });

  return organization;
};
