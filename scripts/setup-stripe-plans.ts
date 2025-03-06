import Stripe from 'stripe';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Use test key for development
const stripeSecretKey = process.env.STRIPE_SECRET_KEY_TEST;

if (!stripeSecretKey) {
  console.error('Missing STRIPE_SECRET_KEY_TEST in environment variables');
  process.exit(1);
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16', // Use the latest API version
});

// Plan definitions matching our Prisma schema
const plans = [
  // Free Plan
  {
    id: 'FREE_MONTHLY',
    name: 'Free',
    description: 'Free plan with basic features',
    amount: 0, // Free
    interval: 'month' as const,
    features: [
      '1 organization',
      '1 widget',
      '100 monthly widget views',
      '"Powered by NowNowNow" branding',
      'Limited features',
    ],
  },
  
  // Basic Plans
  {
    id: 'BASIC_MONTHLY',
    name: 'Basic Monthly',
    description: 'Basic plan with essential features, billed monthly',
    amount: 900, // $9.00
    interval: 'month' as const,
    features: [
      '1 organization',
      '1 widget',
      '500 monthly widget views',
      '"Powered by NowNowNow" branding',
      'Unlimited posts',
      'Post pinning',
      'Post editing',
      'Post archiving',
      'Basic analytics',
    ],
  },
  {
    id: 'BASIC_ANNUAL',
    name: 'Basic Annual',
    description: 'Basic plan with essential features, billed annually (save ~$19)',
    amount: 8900, // $89.00
    interval: 'year' as const,
    features: [
      '1 organization',
      '1 widget',
      '500 monthly widget views',
      '"Powered by NowNowNow" branding',
      'Unlimited posts',
      'Post pinning',
      'Post editing',
      'Post archiving',
      'Basic analytics',
    ],
  },
  {
    id: 'BASIC_LIFETIME',
    name: 'Basic Lifetime',
    description: 'Basic plan with essential features, one-time payment',
    amount: 19900, // $199.00
    interval: null, // One-time payment
    features: [
      '1 organization',
      '1 widget',
      '500 monthly widget views',
      '"Powered by NowNowNow" branding',
      'Unlimited posts',
      'Post pinning',
      'Post editing',
      'Post archiving',
      'Basic analytics',
      'Lifetime access',
    ],
  },
  
  // Pro Plans
  {
    id: 'PRO_MONTHLY',
    name: 'Pro Monthly',
    description: 'Pro plan with advanced features, billed monthly',
    amount: 2900, // $29.00
    interval: 'month' as const,
    features: [
      '5 organizations',
      '5 widgets (1 per organization)',
      '100,000 monthly views',
      'Optional branding',
      'Unlimited posts',
      'Up to 5 team members',
      'Custom domain support',
      'Priority support',
      'Advanced analytics',
      'Post pinning, editing, deleting, and archiving',
    ],
  },
  {
    id: 'PRO_ANNUAL',
    name: 'Pro Annual',
    description: 'Pro plan with advanced features, billed annually (save ~$49)',
    amount: 29900, // $299.00
    interval: 'year' as const,
    features: [
      '5 organizations',
      '5 widgets (1 per organization)',
      '100,000 monthly views',
      'Optional branding',
      'Unlimited posts',
      'Up to 5 team members',
      'Custom domain support',
      'Priority support',
      'Advanced analytics',
      'Post pinning, editing, deleting, and archiving',
    ],
  },
  {
    id: 'PRO_LIFETIME',
    name: 'Pro Lifetime',
    description: 'Pro plan with advanced features, one-time payment',
    amount: 59900, // $599.00
    interval: null, // One-time payment
    features: [
      '5 organizations',
      '5 widgets (1 per organization)',
      '100,000 monthly views',
      'Optional branding',
      'Unlimited posts',
      'Up to 5 team members',
      'Custom domain support',
      'Priority support',
      'Advanced analytics',
      'Post pinning, editing, deleting, and archiving',
      'Lifetime access',
    ],
  },
];

async function createProduct(plan: typeof plans[0]) {
  try {
    // Create or update product
    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description,
      metadata: {
        plan_id: plan.id,
      },
      features: plan.features.map(feature => ({ name: feature })),
    });
    
    console.log(`Created product: ${product.name} (${product.id})`);
    
    // Create price for the product
    let price;
    if (plan.interval) {
      // Recurring price
      price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.amount,
        currency: 'usd',
        recurring: {
          interval: plan.interval,
        },
        metadata: {
          plan_id: plan.id,
        },
      });
    } else {
      // One-time price
      price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.amount,
        currency: 'usd',
        metadata: {
          plan_id: plan.id,
        },
      });
    }
    
    console.log(`Created price: ${price.id} (${plan.amount / 100} USD ${plan.interval || 'one-time'})`);
    
    return {
      planId: plan.id,
      productId: product.id,
      priceId: price.id,
    };
  } catch (error) {
    console.error(`Error creating product/price for ${plan.name}:`, error);
    throw error;
  }
}

async function main() {
  console.log('Setting up Stripe plans...');
  
  const results = [];
  
  for (const plan of plans) {
    const result = await createProduct(plan);
    results.push(result);
  }
  
  console.log('\n\n--- ENVIRONMENT VARIABLES TO ADD ---\n');
  
  for (const result of results) {
    const envVarName = `NEXT_PUBLIC_STRIPE_${result.planId}_PRICE_ID`;
    console.log(`${envVarName}="${result.priceId}"`);
  }
  
  console.log('\n--- END ENVIRONMENT VARIABLES ---\n');
}

main()
  .catch(error => {
    console.error('Error setting up Stripe plans:', error);
    process.exit(1);
  });
