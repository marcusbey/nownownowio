import { z } from "zod";
import { ActionError, action } from "@/lib/actions/safe-actions";
import { stripe } from "@/lib/stripe";
import { getServerUrl } from "@/lib/server-url";
import { prisma } from "@/lib/prisma";

export const updateSubscriptionAction = action
  .meta({ roles: ["ADMIN"] })
  .input(
    z.object({
      priceId: z.string(),
      organizationId: z.string(),
    }),
  )
  .handler(async ({ input }) => {
    try {
      if (!input.priceId) {
        throw new ActionError("Invalid price ID");
      }

      const organization = await prisma.organization.findFirst({
        where: { id: input.organizationId },
      });

      if (!organization) {
        throw new ActionError("Organization not found");
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
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [
          {
            price: input.priceId,
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

      if (!session.url) {
        throw new ActionError("Failed to create checkout session");
      }

      return { url: session.url };
    } catch (error) {
      console.error("Subscription error:", error);
      if (error instanceof ActionError) {
        throw error;
      }
      throw new ActionError("Failed to update subscription");
    }
  });

export const manageBillingAction = action
  .meta({ roles: ["ADMIN"] })
  .input(
    z.object({
      organizationId: z.string(),
    }),
  )
  .handler(async ({ input }) => {
    try {
      const organization = await prisma.organization.findFirst({
        where: { id: input.organizationId },
      });

      if (!organization?.stripeCustomerId) {
        throw new ActionError("No billing information found");
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: organization.stripeCustomerId,
        return_url: `${getServerUrl()}/orgs/${organization.slug}/settings/subscription`,
      });

      return { url: session.url };
    } catch (error) {
      console.error("Billing portal error:", error);
      if (error instanceof ActionError) {
        throw error;
      }
      throw new ActionError("Failed to access billing portal");
    }
  });
