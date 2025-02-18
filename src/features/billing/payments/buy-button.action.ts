"use server";

import { createSearchParamsMessageUrl } from "@/features/ui/searchparams-message/createSearchParamsMessageUrl";
import { ActionError, action } from "@/lib/actions/safe-actions";
import { auth } from "@/lib/auth/helper";
import { prisma } from "@/lib/prisma";
import { getServerUrl } from "@/lib/server-url";
import { createCheckoutSession, retrievePrice } from "@/lib/stripe";
import { z } from "zod";

const BuyButtonSchema = z.object({
  priceId: z.string(),
  orgSlug: z.string(),
});

export const buyButtonAction = action
  .schema(BuyButtonSchema)
  .action(async ({ parsedInput: { priceId, orgSlug } }) => {
    const user = await auth();

    if (!user) {
      throw new ActionError("You must be authenticated to buy a plan");
    }

    const org = await prisma.organization.findFirst({
      where: {
        slug: orgSlug,
        members: {
          some: {
            userId: user.id,
            roles: {
              hasSome: ["OWNER"],
            },
          },
        },
      },
    });

    const stripeCustomerId = org?.stripeCustomerId ?? undefined;

    if (!stripeCustomerId) {
      throw new ActionError(
        "You must be part of an organization to buy a plan",
      );
    }

    const price = await retrievePrice(priceId);
    const priceType = price.type;

    const session = await createCheckoutSession({
      customer: stripeCustomerId,
      mode: priceType === "one_time" ? "payment" : "subscription",
      payment_method_types: ["card", "link"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: createSearchParamsMessageUrl(
        `${getServerUrl()}/orgs/${orgSlug}/settings/billing?session_id={CHECKOUT_SESSION_ID}`,
        "Your payment has been successful",
        "success"
      ),
      cancel_url: createSearchParamsMessageUrl(
        `${getServerUrl()}/orgs/${orgSlug}/settings/billing`,
        "Your payment has been cancelled",
        "error"
      ),
    });

    if (!session.url) {
      throw new ActionError("Something went wrong while creating the session.");
    }

    return { url: session.url };
  });
