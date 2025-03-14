/* eslint-disable @typescript-eslint/switch-exhaustiveness-check */
import { logger } from "@/lib/logger";
import { getServerStripe } from "@/lib/stripe";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { findOrganizationFromCustomer } from "./findUserFromCustomer";
import {
  downgradeUserFromPlan,
  getPlanFromLineItem,
  notifyUserOfPaymentFailure,
  notifyUserOfPremiumDowngrade,
  notifyUserOfPremiumUpgrade,
  upgradeUserToPlan,
} from "./premium.helper";
import { constructStripeEvent } from "./webhooks.stripe.utils";

/**
 * Stripe Webhooks
 *
 * @docs
 * - https://stripe.com/docs/webhooks
 * - https://stripe.com/docs/api/events/types
 */
export const POST = async (req: NextRequest) => {
  const body = await req.text();

  try {
    logger.info("Stripe webhook received");
    logger.info(`Webhook body: ${body.substring(0, 200)}...`); // Log first 200 chars for privacy
    
    let event;
    try {
      event = await constructStripeEvent(body);
      logger.info("Event constructed successfully:", event.type);
    } catch (signatureError) {
      logger.error("Failed to construct Stripe event", signatureError);
      return NextResponse.json({
        ok: false,
        error: "Invalid signature",
      }, { status: 400 });
    }

    let success = true;
    try {
      switch (event.type) {
        case "checkout.session.completed":
          logger.info("Processing checkout.session.completed");
          await onCheckoutSessionCompleted(event.data.object);
          logger.info("Checkout session completed processed successfully");
          break;

        case "checkout.session.expired":
          logger.info("Processing checkout.session.expired");
          await onCheckoutSessionExpired(event.data.object);
          break;

        case "invoice.paid":
          logger.info("Processing invoice.paid");
          await onInvoicePaid(event.data.object);
          break;

        case "invoice.payment_failed":
          logger.info("Processing invoice.payment_failed");
          await onInvoicePaymentFailed(event.data.object);
          break;

        case "customer.subscription.deleted":
          logger.info("Processing customer.subscription.deleted");
          await onCustomerSubscriptionDeleted(event.data.object);
          break;

        case "customer.subscription.updated":
          logger.info("Processing customer.subscription.updated");
          await onCustomerSubscriptionUpdated(event.data.object);
          break;

        default:
          logger.info(`Ignoring unhandled event type: ${event.type}`);
          return NextResponse.json({
            ok: true,
            message: `Event type ${event.type} not handled`,
          });
      }
    } catch (error) {
      const processingError = error as Error;
      success = false;
      logger.error(`Error processing ${event.type} event`, processingError);
      
      // In production, we should return 200 even for errors to prevent Stripe from retrying
      // But we'll include error details in the response
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({
          ok: false,
          error: "Error processing event",
          eventType: event.type,
        });
      } else {
        // In development, we can return a more detailed error
        return NextResponse.json({
          ok: false,
          error: "Error processing event",
          message: processingError.message || 'Unknown error',
          eventType: event.type,
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      ok: true,
      eventType: event.type,
      processed: success,
    });
  } catch (e) {
    logger.error("Stripe Webhook Error", e);
    
    // Always return 200 to Stripe in production to prevent retries
    const status = process.env.NODE_ENV === "production" ? 200 : 500;
    
    return NextResponse.json({
      ok: false,
      error: "Webhook processing error",
    }, { status });
  }
};

async function onCheckoutSessionCompleted(object: Stripe.Checkout.Session) {
  // The user paid and the subscription is active
  // ✅ Grant access to your service
  try {
    // Log the customer ID safely (might be null)
    logger.info(`Finding organization from customer ID: ${object.customer ?? 'null'}`);
    
    // Check if customer ID is null and handle it specially
    if (object.customer === null) {
      logger.warn("Received checkout.session.completed with null customer ID");
      if (process.env.NODE_ENV !== "production") {
        logger.info("Development mode: Will attempt to use fallback organization");
      } else {
        throw new Error("Cannot process webhook with null customer ID in production");
      }
    }
    
    const organization = await findOrganizationFromCustomer(object.customer);
    logger.info(`Organization found: ${organization.id} (${organization.name})`);
    

    let plan: string;
    try {
      logger.info("Getting Stripe instance");
      const stripe = await getServerStripe();
      
      // In development mode, we might not have a valid session ID
      if (process.env.NODE_ENV !== "production" && 
          (!object.id || object.id === "cs_test_123" || object.id.startsWith("cs_test"))) {
        logger.info("Development mode: Using fallback for line items");
        plan = await getPlanFromLineItem([]);
      } else {
        try {
          logger.info(`Retrieving line items for session: ${object.id}`);
          const lineItems = await stripe.checkout.sessions.listLineItems(object.id, {
            limit: 1,
          });
          
          if (lineItems.data.length === 0) {
            logger.warn("No line items found in checkout session");
            if (process.env.NODE_ENV !== "production") {
              logger.info("Development mode: Using fallback for empty line items");
              plan = await getPlanFromLineItem([]);
            } else {
              throw new Error("No line items found in checkout session");
            }
          } else {
            logger.info(`Line items retrieved: ${JSON.stringify(lineItems.data)}`);
            logger.info("Getting plan from line item");
            plan = await getPlanFromLineItem(lineItems.data);
          }
        } catch (lineItemError) {
          logger.error("Error retrieving line items", lineItemError);
          if (process.env.NODE_ENV !== "production") {
            logger.info("Development mode: Using fallback after line item error");
            plan = await getPlanFromLineItem([]);
          } else {
            throw lineItemError;
          }
        }
      }
      
      logger.info("Plan identified:", plan);
    } catch (error) {
      logger.error("Error retrieving plan information", error);
      if (process.env.NODE_ENV !== "production") {
        logger.info("Development mode: Using BASIC plan as fallback after error");
        plan = "BASIC";
      } else {
        throw error;
      }
    }
    
    logger.info("Upgrading user to plan");
    await upgradeUserToPlan(organization.id, plan);
    logger.info("User upgraded successfully");
    
    try {
      logger.info("Sending notification email");
      await notifyUserOfPremiumUpgrade(organization);
      logger.info("Notification sent");
    } catch (emailError) {
      // Don't fail the whole process if email sending fails
      logger.error("Failed to send notification email", emailError);
    }
    
    return true;
  } catch (error) {
    const processingError = error as Error;
    logger.error("Failed to process checkout session completion", processingError);
    
    // In development mode, provide more detailed error information
    if (process.env.NODE_ENV !== "production") {
      logger.debug("Development mode: Checkout session object", {
        id: object.id,
        customer: object.customer,
        paymentStatus: object.payment_status,
        mode: object.mode,
      });
    }
    
    throw processingError;
  }
}

// The user stop the checkout process
async function onCheckoutSessionExpired(object: Stripe.Checkout.Session) {
  logger.debug("Checkout session expired", object);
}

// A payment was made through the invoice (usually a recurring payment for a subscription)
async function onInvoicePaid(object: Stripe.Invoice) {
  const organization = await findOrganizationFromCustomer(object.customer);

  if (organization.planId !== "FREE") return;

  await upgradeUserToPlan(
    organization.id,
    await getPlanFromLineItem(object.lines.data),
  );
}

// A payment failed, usually a recurring payment for a subscription
async function onInvoicePaymentFailed(object: Stripe.Invoice) {
  const user = await findOrganizationFromCustomer(object.customer);

  await downgradeUserFromPlan(user.id);
  await notifyUserOfPaymentFailure(user);
}

// The subscription was canceled
async function onCustomerSubscriptionDeleted(object: Stripe.Subscription) {
  const organization = await findOrganizationFromCustomer(object.customer);
  await downgradeUserFromPlan(organization.id);
  await notifyUserOfPremiumDowngrade(organization);
}

// The subscription was updated
async function onCustomerSubscriptionUpdated(object: Stripe.Subscription) {
  const organization = await findOrganizationFromCustomer(object.customer);

  await upgradeUserToPlan(
    organization.id,
    await getPlanFromLineItem(object.items.data),
  );
  await notifyUserOfPremiumUpgrade(organization);
}
