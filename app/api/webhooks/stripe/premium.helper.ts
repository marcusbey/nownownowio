import SubscriptionDowngradeEmail from "@/emails/SubscriptionDowngradeEmail.email";
import SubscriptionFailedEmail from "@/emails/SubscriptionFailedEmail.email";
import SuccessUpgradeEmail from "@/emails/SuccessUpgradeEmail.email";
import { sendEmail } from "@/lib/mail/sendEmail";
import { prisma } from "@/lib/prisma";
import { getServerUrl } from "@/lib/server-url";
import { getStripeInstance } from "@/lib/stripe";
import type { Organization } from "@prisma/client";
import type Stripe from "stripe";

export const upgradeUserToPlan = async (orgId: string, plan: string) => {
  await prisma.organization.update({
    where: {
      id: orgId,
    },
    data: {
      planId: plan,
    },
  });
};

export const downgradeUserFromPlan = async (orgId: string) => {
  await prisma.organization.update({
    where: {
      id: orgId,
    },
    data: {
      planId: "FREE",
    },
  });
};

export const notifyUserOfPremiumUpgrade = async (user: Organization) => {
  if (!user.email) return;
  
  await sendEmail({
    to: user.email,
    subject: `Welcome to Free Bird! You Now Have Lifetime Access`,
    react: SuccessUpgradeEmail(),
  });
};

export const notifyUserOfPremiumDowngrade = async (org: Organization) => {
  if (!org.email) return;
  
  await sendEmail({
    to: org.email,
    subject: `Important Update: Changes to Your Account Status`,
    react: SubscriptionDowngradeEmail({
      url: `${getServerUrl()}/${org.slug}/settings/billing`,
    }),
  });
};

export const notifyUserOfPaymentFailure = async (org: Organization) => {
  await sendEmail({
    to: org.email ?? "",
    subject: `Action Needed: Complete Your Free Bird Purchase`,
    react: SubscriptionFailedEmail({
      organizationName: org.name,
      portalUrl: `${getServerUrl()}/orgs/${org.slug}/settings/billing`,
    }),
  });
};

export const notifyUserOfPaymentActionRequired = async (org: Organization) => {
  await sendEmail({
    to: org.email ?? "",
    subject: "Additional Authentication Required for Your Free Bird Purchase",
    react: SubscriptionFailedEmail({
      organizationName: org.name,
      portalUrl: `${getServerUrl()}/orgs/${org.slug}/settings/billing`,
    }),
  });
};

/**
 * This method return a valid plan id from the line items.
 *
 * ! You must add a plan_id to the product metadata.
 * Please follow the documentation.
 * @param lineItems Any line items from Stripe
 * @returns A valid plan id
 */
export const getPlanFromLineItem = async (
  lineItems?:
    | Stripe.LineItem[]
    | Stripe.InvoiceLineItem[]
    | Stripe.SubscriptionItem[],
): Promise<string> => {
  if (!lineItems) {
    return "FREE";
  }

  const productId = lineItems[0].price?.product;

  if (!productId) {
    return "FREE";
  }

  const stripe = await getStripeInstance();
  const product = await stripe.products.retrieve(productId as string);

  const planId = product.metadata.plan_id;

  if (!planId) {
    throw new Error(
      "Invalid plan : you must add a plan_id to the product metadata.",
    );
  }

  const plan = await prisma.organizationPlan.findFirst({
    where: {
      id: planId,
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (!plan) {
    throw new Error(
      `Invalid plan : you add the plan_id ${planId} to the product but this plan doesn't exist.`,
    );
  }

  return plan.id;
};
