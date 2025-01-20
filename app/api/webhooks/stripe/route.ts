import { logger } from "@/lib/logger";
import { getStripeInstance } from "@/lib/stripe";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { findOrganizationFromCustomer } from "./findUserFromCustomer";
import {
  downgradeUserFromPlan,
  getPlanFromLineItem,
  notifyUserOfPaymentActionRequired,
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
    const event = await constructStripeEvent(body);

    switch (event.type) {
      case "checkout.session.completed":
        await onCheckoutSessionCompleted(event.data.object);
        break;

      case "checkout.session.expired":
        await onCheckoutSessionExpired(event.data.object);
        break;

      case "invoice.paid":
        await onInvoicePaid(event.data.object);
        break;

      case "invoice.payment_failed":
        await onInvoicePaymentFailed(event.data.object);
        break;

      case "invoice.payment_action_required":
        await onInvoicePaymentActionRequired(event.data.object);
        break;

      case "customer.subscription.deleted":
        await onCustomerSubscriptionDeleted(event.data.object);
        break;

      case "customer.subscription.created":
        await onCustomerSubscriptionCreated(event.data.object);
        break;

      case "customer.subscription.updated":
        await onCustomerSubscriptionUpdated(event.data.object);
        break;

      default:
        return NextResponse.json({
          ok: true,
        });
    }

    return NextResponse.json({
      ok: true,
    });
  } catch (e) {
    logger.error("Stripe Webhook Error", e);
    return NextResponse.json({
      ok: false,
    });
  }
};

async function onCheckoutSessionCompleted(object: Stripe.Checkout.Session) {
  // The user paid and the subscription is active
  // Grant access to your service
  const organization = await findOrganizationFromCustomer(object.customer);

  const stripe = await getStripeInstance();
  const lineItems = await stripe.checkout.sessions.listLineItems(object.id, {
    limit: 1,
  });

  await upgradeUserToPlan(
    organization.id,
    await getPlanFromLineItem(lineItems.data),
  );
  await notifyUserOfPremiumUpgrade(organization);
}

// The user stop the checkout process
async function onCheckoutSessionExpired(object: Stripe.Checkout.Session) {
  logger.debug("Checkout session expired", object);
}

// A payment was made through the invoice (usually a recurring payment for a subscription)
async function onInvoicePaid(object: Stripe.Invoice) {
  const organization = await findOrganizationFromCustomer(object.customer);

  if (organization.planId !== "FREE") return;

  const stripe = await getStripeInstance();
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

  const stripe = await getStripeInstance();
  await upgradeUserToPlan(
    organization.id,
    await getPlanFromLineItem(object.items.data),
  );
  await notifyUserOfPremiumUpgrade(organization);
}

/**
 * Handle when additional authentication is required for payment
 */
async function onInvoicePaymentActionRequired(object: Stripe.Invoice) {
  const organization = await findOrganizationFromCustomer(object.customer as string);
  if (!organization) return;

  await notifyUserOfPaymentActionRequired(organization);
}

/**
 * Handle when a new subscription is created
 */
async function onCustomerSubscriptionCreated(object: Stripe.Subscription) {
  const organization = await findOrganizationFromCustomer(object.customer as string);
  if (!organization) return;

  const stripe = await getStripeInstance();
  const plan = await getPlanFromLineItem(object.items.data);
  
  await upgradeUserToPlan(organization.id, plan);
  await notifyUserOfPremiumUpgrade(organization);
}
