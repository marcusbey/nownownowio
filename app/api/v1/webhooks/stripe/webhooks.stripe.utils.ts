import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { getServerStripe } from "@/lib/stripe";
import { headers } from "next/headers";
import type { Stripe } from "stripe";

export async function constructStripeEvent(
  body: string,
): Promise<Stripe.Event> {
  const headerList = await headers();

  const stripeSignature = headerList.get("stripe-signature");

  const isProduction = process.env.NODE_ENV === "production";
  const webhookSecret = isProduction
    ? env.STRIPE_WEBHOOK_SECRET_LIVE ?? ''
    : env.STRIPE_WEBHOOK_SECRET_TEST ?? '';

  let event: Stripe.Event | null = null;
  try {
    const stripe = await getServerStripe();
    event = stripe.webhooks.constructEvent(
      body,
      stripeSignature ?? "",
      webhookSecret,
    );
  } catch (error) {
    logger.error(
      `Webhook signature verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw new Error("Invalid webhook signature");
  }

  return event;
}
