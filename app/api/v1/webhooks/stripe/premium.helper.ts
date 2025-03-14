import { logger } from "@/lib/logger";
import { sendEmail } from "@/lib/mail/sendEmail";
import { prisma } from "@/lib/prisma";
import { getServerUrl } from "@/lib/server-url";
import { getServerStripe } from "@/lib/stripe";
// Import email templates correctly
import SubscriptionDowngradeEmail from "@/emails/subscription-downgrade-email.email";
import SubscriptionFailedEmail from "@/emails/subscription-failed-email.email";
import SuccessUpgradeEmail from "@/emails/success-upgrade-email.email";
import type { Organization } from "@prisma/client";
import type Stripe from "stripe";

export const upgradeUserToPlan = async (orgId: string, plan: string) => {
  // First get the current organization to save its current plan as the previous plan
  const currentOrg = await prisma.organization.findUnique({
    where: {
      id: orgId,
    },
    select: {
      planId: true
    }
  });
  
  // Only update if the plan is actually changing
  if (currentOrg && currentOrg.planId !== plan) {
    await prisma.organization.update({
      where: {
        id: orgId,
      },
      data: {
        previousPlanId: currentOrg.planId, // Store the current plan as previous plan
        planId: plan,                      // Set the new plan
        planChangedAt: new Date(),         // Record when the plan was changed
      },
    });
    
    // Also create a plan history record
    await prisma.organizationPlanHistory.create({
      data: {
        organizationId: orgId,
        planId: plan,
        previousPlanId: currentOrg.planId, // TypeScript will handle this correctly
        changeType: "UPGRADE",
        startDate: new Date(),
        notes: "Plan upgraded via Stripe payment"
      }
    });
  } else {
    // If the plan isn't changing or we couldn't find the org, just update the plan ID
    await prisma.organization.update({
      where: {
        id: orgId,
      },
      data: {
        planId: plan,
      },
    });
  }
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
  // Only send email if user has an email address
  if (user.email) {
    try {
      logger.info(`Sending premium upgrade notification email to ${user.email}`);
      const result = await sendEmail({
        to: user.email,
        subject: `Success! You've Unlocked Full Access to Our Features`,
        react: SuccessUpgradeEmail(),
      });
      
      // The result might contain an error even if the promise resolves
      if ('error' in result && result.error) {
        // The error message might be undefined in some cases
        const errorMessage = typeof result.error === 'object' ? result.error.message : undefined;
        logger.warn(`Email notification sent but with error: ${errorMessage ?? 'Unknown error'}`, {
          orgId: user.id,
          orgName: user.name,
          emailId: result.data?.id ?? 'unknown',
        });
      } else {
        logger.info(`Email notification sent successfully to ${user.email}`, {
          orgId: user.id,
          orgName: user.name,
          emailId: result.data?.id ?? 'unknown',
        });
      }
    } catch (error) {
      // Don't throw the error - just log it and continue
      logger.error(`Failed to send premium upgrade notification email to ${user.email}`, {
        error,
        orgId: user.id,
        orgName: user.name,
      });
    }
  } else {
    logger.warn(`Cannot send premium upgrade notification - organization has no email`, {
      orgId: user.id,
      orgName: user.name,
    });
  }
};

export const notifyUserOfPremiumDowngrade = async (org: Organization) => {
  // Only send email if organization has an email address
  if (org.email) {
    try {
      logger.info(`Sending premium downgrade notification email to ${org.email}`);
      const result = await sendEmail({
        to: org.email,
        subject: `Important Update: Changes to Your Account Status`,
        react: SubscriptionDowngradeEmail({
          url: `${getServerUrl()}/${org.slug}/settings/billing`,
        }),
      });
      
      // The result might contain an error even if the promise resolves
      if ('error' in result && result.error) {
        // The error message might be undefined in some cases
        const errorMessage = typeof result.error === 'object' ? result.error.message : undefined;
        logger.warn(`Email notification sent but with error: ${errorMessage ?? 'Unknown error'}`, {
          orgId: org.id,
          orgName: org.name,
          emailId: result.data?.id ?? 'unknown',
        });
      } else {
        logger.info(`Email notification sent successfully to ${org.email}`, {
          orgId: org.id,
          orgName: org.name,
          emailId: result.data?.id ?? 'unknown',
        });
      }
    } catch (error) {
      // Don't throw the error - just log it and continue
      logger.error(`Failed to send premium downgrade notification email to ${org.email}`, {
        error,
        orgId: org.id,
        orgName: org.name,
      });
    }
  } else {
    logger.warn(`Cannot send premium downgrade notification - organization has no email`, {
      orgId: org.id,
      orgName: org.name,
    });
  }
};

export const notifyUserOfPaymentFailure = async (org: Organization) => {
  // Only send email if organization has an email address
  if (org.email) {
    try {
      logger.info(`Sending payment failure notification email to ${org.email}`);
      const result = await sendEmail({
        to: org.email,
        subject: `Action Needed: Update Your Payment to Continue Enjoying Our Services`,
        react: SubscriptionFailedEmail({
          url: `${getServerUrl()}/${org.slug}/settings/billing`,
        }),
      });
      
      // The result might contain an error even if the promise resolves
      if ('error' in result && result.error) {
        // The error message might be undefined in some cases
        const errorMessage = typeof result.error === 'object' ? result.error.message : undefined;
        logger.warn(`Email notification sent but with error: ${errorMessage ?? 'Unknown error'}`, {
          orgId: org.id,
          orgName: org.name,
          emailId: result.data?.id ?? 'unknown',
        });
      } else {
        logger.info(`Email notification sent successfully to ${org.email}`, {
          orgId: org.id,
          orgName: org.name,
          emailId: result.data?.id ?? 'unknown',
        });
      }
    } catch (error) {
      // Don't throw the error - just log it and continue
      logger.error(`Failed to send payment failure notification email to ${org.email}`, {
        error,
        orgId: org.id,
        orgName: org.name,
      });
    }
  } else {
    logger.warn(`Cannot send payment failure notification - organization has no email`, {
      orgId: org.id,
      orgName: org.name,
    });
  }
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
  // In development mode, if we're testing with mock data, provide a fallback
  if (process.env.NODE_ENV !== "production") {
    if (!lineItems || lineItems.length === 0 || !lineItems[0].price?.product) {
      // Check if we have any plans in the database to use as fallback
      const fallbackPlan = await prisma.organizationPlan.findFirst({
        where: {
          NOT: {
            id: "FREE"
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        select: {
          id: true,
          name: true
        }
      });
      
      if (fallbackPlan) {
        logger.info(`Development mode: Using fallback plan ${fallbackPlan.name} (${fallbackPlan.id})`);
        return fallbackPlan.id;
      }
      
      logger.info("Development mode: Using BASIC plan as fallback");
      return "BASIC";
    }
  }
  
  if (!lineItems || lineItems.length === 0) {
    return "FREE";
  }

  const productId = lineItems[0].price?.product;

  if (!productId) {
    return "FREE";
  }

  try {
    const stripe = await getServerStripe();
    const product = await stripe.products.retrieve(productId as string);

    const planId = product.metadata.plan_id;

    if (!planId) {
      logger.warn("No plan_id found in product metadata", { productId });
      return "FREE";
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
      logger.warn(`Plan ${planId} specified in product metadata doesn't exist in database`, { productId, planId });
      return "FREE";
    }

    return plan.id;
  } catch (error) {
    logger.error("Error retrieving plan from line item", { error, productId });
    
    if (process.env.NODE_ENV !== "production") {
      logger.info("Development mode: Using BASIC plan as fallback after error");
      return "BASIC";
    }
    
    return "FREE";
  }
};
