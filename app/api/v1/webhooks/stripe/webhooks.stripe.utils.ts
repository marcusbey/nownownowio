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
  const isDevelopment = process.env.NODE_ENV === "development";
  const webhookSecret = isProduction
    ? env.STRIPE_WEBHOOK_SECRET_LIVE ?? ''
    : env.STRIPE_WEBHOOK_SECRET_TEST ?? '';

  // Parse the event from the request body
  let jsonBody: Record<string, unknown>;
  try {
    jsonBody = JSON.parse(body);
  } catch (e) {
    logger.error(`Failed to parse webhook body: ${e instanceof Error ? e.message : 'Unknown error'}`);
    throw new Error("Invalid webhook body");
  }

  let event: Stripe.Event | null = null;
  try {
    const stripe = await getServerStripe();
    
    // In development mode, if we don't have a valid signature or secret, create a mock event
    if (isDevelopment && (!stripeSignature || !webhookSecret)) {
      logger.info("Development mode: Bypassing webhook signature verification");
      // Use the parsed body directly as the event
      event = jsonBody as unknown as Stripe.Event;
    } else {
      // Normal production path - verify signature
      event = stripe.webhooks.constructEvent(
        body,
        stripeSignature ?? "",
        webhookSecret,
      );
    }
  } catch (error) {
    logger.error(
      `Webhook signature verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    
    // In development, provide a fallback if signature verification fails
    if (isDevelopment) {
      logger.warn("Development mode: Using parsed webhook body without signature verification");
      event = jsonBody as unknown as Stripe.Event;
    } else {
      throw new Error("Invalid webhook signature");
    }
  }

  return event;
}
