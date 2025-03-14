import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

/**
 * This function take a Stripe customer object and find the user in the database
 *
 * - If the user is found, it returns the user
 * - If the user is not found, it creates a new user and returns it
 *
 * @param stripeCustomer The customer object from Stripe
 * @returns a valid user from the database
 */
export const findOrganizationFromCustomer = async (
  stripeCustomer: string | Stripe.Customer | Stripe.DeletedCustomer | null,
) => {
  logger.info(`Finding organization from customer ID: ${stripeCustomer === null ? 'null' : typeof stripeCustomer === 'string' ? stripeCustomer : stripeCustomer.id}`);
  
  // In development mode, if customer is null, we can use a fallback
  if (stripeCustomer === null && process.env.NODE_ENV !== "production") {
    logger.info("Development mode: Using fallback organization for null customer ID");
    const fallbackOrg = await prisma.organization.findFirst({
      orderBy: { createdAt: "desc" },
    });
    
    if (fallbackOrg) {
      logger.info(`Using organization ${fallbackOrg.name} (${fallbackOrg.id}) as fallback`);
      return fallbackOrg;
    }
    logger.error("No fallback organization found in database");
    throw new Error("No organization found to use as fallback");
  }
  
  let stripeCustomerId: string;

  if (typeof stripeCustomer === "string") {
    stripeCustomerId = stripeCustomer;
  } else if (stripeCustomer) {
    stripeCustomerId = stripeCustomer.id;
  } else {
    throw new Error("Invalid customer");
  }

  try {
    const organization = await prisma.organization.findFirstOrThrow({
      where: {
        stripeCustomerId,
      },
    });
    return organization;
  } catch (error) {
    // Log the error but continue with fallback logic
    logger.debug('Error finding organization by customer ID', { error, stripeCustomerId });
    // In development mode, provide a fallback for testing
    if (process.env.NODE_ENV !== "production") {
      logger.info("Development mode: Using fallback organization for webhook testing");
      
      // Try to find any organization to use as a fallback
      const fallbackOrg = await prisma.organization.findFirst({
        orderBy: { createdAt: "desc" },
      });
      
      if (fallbackOrg) {
        logger.info(`Using organization ${fallbackOrg.name} (${fallbackOrg.id}) as fallback`);
        return fallbackOrg;
      }
      
      logger.error("No fallback organization found in database");
    }
    
    logger.warn("Invalid customer", { stripeCustomerId });
    logger.warn("You must ask the user to create an account and an organization before using the app.");
    throw new Error("Invalid customer");
  }
};
