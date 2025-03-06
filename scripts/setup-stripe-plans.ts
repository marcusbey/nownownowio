const Stripe = require('stripe');
// Use Node's built-in module instead of dotenv
const fs = require('fs');

// Load environment variables from .env.stripe file manually
const envContent = fs.readFileSync('.env.stripe', 'utf8');
const envVars = envContent.split('\n').reduce((acc, line) => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    acc[match[1].trim()] = match[2].trim().replace(/^"|"$/g, '');
  }
  return acc;
}, {});

// Use live key for production
const stripeSecretKey = envVars.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error('Missing STRIPE_SECRET_KEY in environment variables');
  process.exit(1);
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16', // Use a supported API version
});

// Plan structure definition (commented as we're using JS)
/**
 * @typedef {Object} StripePlan
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {number} amount
 * @property {('month'|'year'|null)} interval
 * @property {number} [trial_period_days]
 * @property {string[]} features
 */

// Plan definitions matching our Prisma schema
const plans = [
  // Basic Plans
  {
    id: 'BASIC_MONTHLY',
    name: 'Basic Monthly',
    description: 'Perfect for individuals and personal websites',
    amount: 900, // $9.00
    interval: 'month',
    trial_period_days: 7, // 7-day free trial
    features: [
      '1 organization/project',
      '1 widget (can be embedded on multiple websites)',
      'Same feed appears across all embeddings',
      '"Powered by NowNowNow" branding',
      'Unlimited posts',
      'Unlimited widget views',
      'Full post management (pin, edit, delete, archive)',
      '1 team member',
      'Email support',
      '7-day free trial'
    ],
  },
  {
    id: 'BASIC_ANNUAL',
    name: 'Basic Annual',
    description: 'Perfect for individuals and personal websites, billed annually (save 20%)',
    amount: 8640, // $86.40 ($7.20/mo * 12)
    interval: 'year',
    trial_period_days: 7, // 7-day free trial
    features: [
      '1 organization/project',
      '1 widget (can be embedded on multiple websites)',
      'Same feed appears across all embeddings',
      '"Powered by NowNowNow" branding',
      'Unlimited posts',
      'Unlimited widget views',
      'Full post management (pin, edit, delete, archive)',
      '1 team member',
      'Email support',
      'Save 20% with annual billing',
      '7-day free trial'
    ],
  },
  {
    id: 'BASIC_LIFETIME',
    name: 'Basic Lifetime',
    description: 'Perfect for individuals and personal websites, one-time payment',
    amount: 19900, // $199.00
    interval: null, // One-time payment
    features: [
      '1 organization/project',
      '1 widget (can be embedded on multiple websites)',
      'Same feed appears across all embeddings',
      '"Powered by NowNowNow" branding',
      'Unlimited posts',
      'Unlimited widget views',
      'Full post management (pin, edit, delete, archive)',
      '1 team member',
      'Email support',
      'One-time payment',
      'Lifetime access',
      'All future updates included'
    ],
  },
  
  // Pro Plans
  {
    id: 'PRO_MONTHLY',
    name: 'Pro Monthly',
    description: 'For entrepreneurs with multiple projects, billed monthly',
    amount: 1900, // $19.00
    interval: 'month',
    trial_period_days: 7, // 7-day free trial
    features: [
      '5 organizations/projects',
      '5 widgets (1 per organization)',
      'Each widget can be embedded on multiple websites',
      'Optional "Powered by NowNowNow" branding',
      'Unlimited posts for each organization',
      'Unlimited widget views',
      'Full post management',
      'Up to 5 team members',
      'Custom domain support',
      'User chat functionality',
      'Advanced analytics dashboard',
      'Priority support',
      'Priority access to new features',
      '7-day free trial'
    ],
  },
  {
    id: 'PRO_ANNUAL',
    name: 'Pro Annual',
    description: 'For entrepreneurs with multiple projects, billed annually (save 20%)',
    amount: 18240, // $182.40 ($15.20/mo * 12)
    interval: 'year',
    trial_period_days: 7, // 7-day free trial
    features: [
      '5 organizations/projects',
      '5 widgets (1 per organization)',
      'Each widget can be embedded on multiple websites',
      'Optional "Powered by NowNowNow" branding',
      'Unlimited posts for each organization',
      'Unlimited widget views',
      'Full post management',
      'Up to 5 team members',
      'Custom domain support',
      'User chat functionality',
      'Advanced analytics dashboard',
      'Priority support',
      'Priority access to new features',
      'Save 20% with annual billing',
      '7-day free trial'
    ],
  },
  {
    id: 'PRO_LIFETIME',
    name: 'Pro Lifetime',
    description: 'For entrepreneurs with multiple projects, one-time payment',
    amount: 39900, // $399.00
    interval: null, // One-time payment
    features: [
      '5 organizations/projects',
      '5 widgets (1 per organization)',
      'Each widget can be embedded on multiple websites',
      'Optional "Powered by NowNowNow" branding',
      'Unlimited posts for each organization',
      'Unlimited widget views',
      'Full post management',
      'Up to 5 team members',
      'Custom domain support',
      'User chat functionality',
      'Advanced analytics dashboard',
      'Priority support',
      'Priority access to new features',
      'One-time payment',
      'Lifetime access',
      'All future updates included'
    ],
  },
];

/**
 * Creates a Stripe product and price for a plan
 * @param {StripePlan} plan - The plan to create in Stripe
 * @returns {Promise<{planId: string, productId: string, priceId: string}>}
 */
async function createProduct(plan) {
  try {
    // Create or update product
    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description,
      metadata: {
        plan_id: plan.id,
        features: JSON.stringify(plan.features)
      }
    });
    
    console.log(`Created product: ${product.name} (${product.id})`);
    
    // Create price for the product
    let price;
    if (plan.interval) {
      // Recurring price
      const priceParams = {
        product: product.id,
        unit_amount: plan.amount,
        currency: 'usd',
        recurring: {
          interval: plan.interval,
        },
        metadata: {
          plan_id: plan.id,
        }
      };
      
      // Add trial period if specified
      if (plan.trial_period_days) {
        priceParams.recurring.trial_period_days = plan.trial_period_days;
      }
      
      price = await stripe.prices.create(priceParams);
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
