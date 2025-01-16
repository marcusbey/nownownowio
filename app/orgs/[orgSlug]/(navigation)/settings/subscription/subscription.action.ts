import { z } from "zod";
import { ActionError, orgAction } from "@/lib/actions/safe-actions";
import { stripe } from "@/lib/stripe";
import { getServerUrl } from "@/lib/server-url";
import { prisma } from "@/lib/prisma";

const updateSubscriptionSchema = z.object({
  priceId: z.string(),
  organizationId: z.string(),
});

export const updateSubscriptionAction = orgAction
  .metadata({ roles: ["ADMIN"] })
  .schema(updateSubscriptionSchema)
  .action(async ({ parsedInput: { priceId, organizationId }, ctx }) => {
    try {
      if (!priceId) {
        throw new ActionError("Invalid price ID");
      }

      const organization = await prisma.organization.findFirst({
        where: { id: organizationId },
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
          data: { stripeCustomerId: customer.id },
        });
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        mode: "subscription",
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${getServerUrl()}/orgs/${organization.slug}/settings/subscription?success=true`,
        cancel_url: `${getServerUrl()}/orgs/${organization.slug}/settings/subscription?canceled=true`,
        metadata: {
          organizationId: organization.id,
        },
      });

      return { url: session.url };
    } catch (error) {
      if (error instanceof Error) {
        throw new ActionError(error.message);
      }
      throw new ActionError("Failed to create checkout session");
    }
  });

const manageBillingSchema = z.object({
  organizationId: z.string(),
});

export const manageBillingAction = orgAction
  .metadata({ roles: ["ADMIN"] })
  .schema(manageBillingSchema)
  .action(async ({ parsedInput: { organizationId }, ctx }) => {
    try {
      const organization = await prisma.organization.findFirst({
        where: { id: organizationId },
      });

      if (!organization) {
        throw new ActionError("Organization not found");
      }

      if (!organization.stripeCustomerId) {
        throw new ActionError("No billing information found");
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: organization.stripeCustomerId,
        return_url: `${getServerUrl()}/orgs/${organization.slug}/settings/subscription`,
      });

      return { url: session.url };
    } catch (error) {
      if (error instanceof Error) {
        throw new ActionError(error.message);
      }
      throw new ActionError("Failed to create billing portal session");
    }
  });
