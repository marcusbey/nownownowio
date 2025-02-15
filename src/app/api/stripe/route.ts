import { NextResponse } from 'next/server';
import { constructWebhookEvent } from '@/lib/stripe';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    const message = 'Missing stripe-signature header';
    logger.error(message);
    return new NextResponse(message, { status: 400 });
  }

  try {
    const webhookSecret = env.NODE_ENV === 'production'
      ? env.STRIPE_WEBHOOK_SECRET_LIVE
      : env.STRIPE_WEBHOOK_SECRET_TEST;

    if (!webhookSecret) {
      const message = `Missing webhook secret for ${env.NODE_ENV} environment`;
      logger.error(message);
      return new NextResponse(message, { status: 500 });
    }

    const event = await constructWebhookEvent(payload, signature, webhookSecret);

    logger.info(`Processing Stripe webhook event: ${event.type} in ${env.NODE_ENV} mode`);

    // Handle event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        logger.info('Payment succeeded:', event.data.object);
        break;
      case 'payment_intent.payment_failed':
        logger.error('Payment failed:', event.data.object);
        break;
      default:
        logger.warn(`Unhandled event type: ${event.type}`);
    }

    return new NextResponse(JSON.stringify({ received: true }), { status: 200 });

    return NextResponse.json({ received: true });
  } catch (err) {
    logger.error('Stripe webhook error:', err);
    return NextResponse.json(
      { error: 'Webhook verification failed' },
      { status: 400 }
    );
  }
}