const Stripe = require('stripe');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.stripe file
const envPath = path.resolve(process.cwd(), '.env.stripe');
if (!fs.existsSync(envPath)) {
  console.error('.env.stripe file not found.');
  process.exit(1);
}

dotenv.config({ path: envPath });

// Get mode from command line arguments
const args = process.argv.slice(2);
const forceLiveMode = args.includes('--live');
const forceTestMode = args.includes('--test');

// Determine whether to use live or test mode
let useLiveMode;
if (forceLiveMode) {
  useLiveMode = true;
} else if (forceTestMode) {
  useLiveMode = false;
} else {
  useLiveMode = process.env.USE_LIVE_MODE === 'true';
}

const stripeSecretKey = useLiveMode 
  ? process.env.STRIPE_LIVE_SECRET_KEY 
  : process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error(`Missing ${useLiveMode ? 'STRIPE_LIVE_SECRET_KEY' : 'STRIPE_SECRET_KEY'} in .env.stripe file`);
  process.exit(1);
}

console.log(`Using Stripe in ${useLiveMode ? 'LIVE' : 'TEST'} mode`);

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
});

// Plan definitions based on the fallback-prices.ts file
const plans = [
  // Basic Plans
  {
    id: 'BASIC_MONTHLY',
    name: 'Basic Monthly',
    description: 'Perfect for individuals and small teams',
    amount: 1400, // $14.00
    interval: 'month',
    trial_period_days: 7,
    features: [
      'Up to 5 team members',
      'Remove "Powered by" branding',
      'Unlimited posts',
      'Full post management',
      'Email support',
      '7-day free trial'
    ],
    metadata: {
      planType: 'BASIC',
      billingCycle: 'MONTHLY'
    }
  },
  {
    id: 'BASIC_ANNUAL',
    name: 'Basic Annual',
    description: 'Perfect for individuals and small teams, billed annually (save 20%)',
    amount: 13400, // $134.00
    interval: 'year',
    trial_period_days: 7,
    features: [
      'Up to 5 team members',
      'Remove "Powered by" branding',
      'Unlimited posts',
      'Full post management',
      'Email support',
      'Save 20% with annual billing',
      '7-day free trial'
    ],
    metadata: {
      planType: 'BASIC',
      billingCycle: 'ANNUAL'
    }
  },
  {
    id: 'BASIC_LIFETIME',
    name: 'Basic Lifetime',
    description: 'Perfect for individuals and small teams, one-time payment',
    amount: 29900, // $299.00
    interval: null, // One-time payment
    features: [
      'Up to 5 team members',
      'Remove "Powered by" branding',
      'Unlimited posts',
      'Full post management',
      'Email support',
      'One-time payment',
      'Lifetime access'
    ],
    metadata: {
      planType: 'BASIC',
      billingCycle: 'LIFETIME'
    }
  },
  // Pro Plans
  {
    id: 'PRO_MONTHLY',
    name: 'Pro Monthly',
    description: 'Perfect for growing teams and businesses',
    amount: 2900, // $29.00
    interval: 'month',
    trial_period_days: 7,
    features: [
      'Unlimited team members',
      'Remove "Powered by" branding',
      'Unlimited posts',
      'Full post management',
      'Priority support',
      'Advanced analytics',
      '7-day free trial'
    ],
    metadata: {
      planType: 'PRO',
      billingCycle: 'MONTHLY'
    }
  },
  {
    id: 'PRO_ANNUAL',
    name: 'Pro Annual',
    description: 'Perfect for growing teams and businesses, billed annually (save 20%)',
    amount: 27800, // $278.00
    interval: 'year',
    trial_period_days: 7,
    features: [
      'Unlimited team members',
      'Remove "Powered by" branding',
      'Unlimited posts',
      'Full post management',
      'Priority support',
      'Advanced analytics',
      'Save 20% with annual billing',
      '7-day free trial'
    ],
    metadata: {
      planType: 'PRO',
      billingCycle: 'ANNUAL'
    }
  },
  {
    id: 'PRO_LIFETIME',
    name: 'Pro Lifetime',
    description: 'Perfect for growing teams and businesses, one-time payment',
    amount: 59900, // $599.00
    interval: null, // One-time payment
    features: [
      'Unlimited team members',
      'Remove "Powered by" branding',
      'Unlimited posts',
      'Full post management',
      'Priority support',
      'Advanced analytics',
      'One-time payment',
      'Lifetime access'
    ],
    metadata: {
      planType: 'PRO',
      billingCycle: 'LIFETIME'
    }
  },
  // Free Plan
  {
    id: 'FREE',
    name: 'Free Plan',
    description: 'Basic features for personal use',
    amount: 0, // $0.00
    interval: 'month',
    features: [
      '1 team member',
      '"Powered by" branding',
      'Unlimited posts',
      'Basic post management'
    ],
    metadata: {
      planType: 'FREE',
      billingCycle: 'MONTHLY'
    }
  },
  // Add-ons
  {
    id: 'ADDITIONAL_ORG_MONTHLY',
    name: 'Additional Organization (Monthly)',
    description: 'Add an additional organization to your plan',
    amount: 900, // $9.00
    interval: 'month',
    features: [
      'One additional organization',
      'All features of your current plan'
    ],
    metadata: {
      addonType: 'ADDITIONAL_ORG',
      billingCycle: 'MONTHLY'
    }
  },
  {
    id: 'ADDITIONAL_ORG_ANNUAL',
    name: 'Additional Organization (Annual)',
    description: 'Add an additional organization to your plan, billed annually',
    amount: 8600, // $86.00
    interval: 'year',
    features: [
      'One additional organization',
      'All features of your current plan',
      'Save 20% with annual billing'
    ],
    metadata: {
      addonType: 'ADDITIONAL_ORG',
      billingCycle: 'ANNUAL'
    }
  },
  {
    id: 'ADDITIONAL_MEMBER_MONTHLY',
    name: 'Additional Team Member (Monthly)',
    description: 'Add an additional team member to your plan',
    amount: 500, // $5.00
    interval: 'month',
    features: [
      'One additional team member',
      'All features of your current plan'
    ],
    metadata: {
      addonType: 'ADDITIONAL_MEMBER',
      billingCycle: 'MONTHLY'
    }
  },
  {
    id: 'ADDITIONAL_MEMBER_ANNUAL',
    name: 'Additional Team Member (Annual)',
    description: 'Add an additional team member to your plan, billed annually',
    amount: 4800, // $48.00
    interval: 'year',
    features: [
      'One additional team member',
      'All features of your current plan',
      'Save 20% with annual billing'
    ],
    metadata: {
      addonType: 'ADDITIONAL_MEMBER',
      billingCycle: 'ANNUAL'
    }
  }
];

/**
 * Creates or updates a Stripe product and price
 */
async function createOrUpdateProduct(plan) {
  try {
    console.log(`Processing plan: ${plan.name}`);
    
    // Check if product already exists with the same metadata
    let product;
    let existingProduct = null;
    
    try {
      // Try to find existing products with similar metadata
      const existingProducts = await stripe.products.list({
        active: true,
        limit: 100
      });
      
      existingProduct = existingProducts.data.find(p => 
        (p.metadata?.planType === plan.metadata?.planType && 
         p.metadata?.billingCycle === plan.metadata?.billingCycle) ||
        (p.metadata?.addonType === plan.metadata?.addonType && 
         p.metadata?.billingCycle === plan.metadata?.billingCycle)
      );
    } catch (error) {
      console.warn('Error fetching existing products:', error.message);
    }
    
    if (existingProduct) {
      console.log(`Updating existing product: ${existingProduct.name} (${existingProduct.id})`);
      product = await stripe.products.update(existingProduct.id, {
        name: plan.name,
        description: plan.description,
        metadata: plan.metadata
      });
    } else {
      console.log(`Creating new product: ${plan.name}`);
      product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: plan.metadata
      });
    }
    
    // Create a new price for the product
    const priceParams = {
      product: product.id,
      unit_amount: plan.amount,
      currency: 'usd',
      metadata: plan.metadata
    };
    
    if (plan.interval) {
      priceParams.recurring = {
        interval: plan.interval
      };
      
      if (plan.trial_period_days) {
        priceParams.recurring.trial_period_days = plan.trial_period_days;
      }
    }
    
    const price = await stripe.prices.create(priceParams);
    
    console.log(`Created price: ${price.id} (${plan.amount / 100} USD ${plan.interval || 'one-time'})`);
    
    return {
      planId: plan.id,
      productId: product.id,
      priceId: price.id,
      metadata: plan.metadata
    };
  } catch (error) {
    console.error(`Error creating/updating product/price for ${plan.name}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log(`Setting up Stripe plans in ${useLiveMode ? 'LIVE' : 'TEST'} mode...`);
  
  const results = [];
  
  for (const plan of plans) {
    try {
      const result = await createOrUpdateProduct(plan);
      results.push(result);
    } catch (error) {
      console.error(`Failed to process plan ${plan.id}:`, error.message);
    }
  }
  
  console.log('\n\n--- ENVIRONMENT VARIABLES TO ADD ---\n');
  
  // Generate environment variables
  const envVars = {};
  
  for (const result of results) {
    let envVarName;
    
    if (result.metadata.planType === 'BASIC') {
      if (result.metadata.billingCycle === 'MONTHLY') {
        envVarName = useLiveMode ? 'NEXT_PUBLIC_STRIPE_LIVE_BASIC_MONTHLY_PRICE_ID' : 'NEXT_PUBLIC_STRIPE_BASIC_MONTHLY_PRICE_ID';
      } else if (result.metadata.billingCycle === 'ANNUAL') {
        envVarName = useLiveMode ? 'NEXT_PUBLIC_STRIPE_LIVE_BASIC_ANNUAL_PRICE_ID' : 'NEXT_PUBLIC_STRIPE_BASIC_ANNUAL_PRICE_ID';
      } else if (result.metadata.billingCycle === 'LIFETIME') {
        envVarName = useLiveMode ? 'NEXT_PUBLIC_STRIPE_LIVE_BASIC_LIFETIME_PRICE_ID' : 'NEXT_PUBLIC_STRIPE_BASIC_LIFETIME_PRICE_ID';
      }
    } else if (result.metadata.planType === 'PRO') {
      if (result.metadata.billingCycle === 'MONTHLY') {
        envVarName = useLiveMode ? 'NEXT_PUBLIC_STRIPE_LIVE_PRO_MONTHLY_PRICE_ID' : 'NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID';
      } else if (result.metadata.billingCycle === 'ANNUAL') {
        envVarName = useLiveMode ? 'NEXT_PUBLIC_STRIPE_LIVE_PRO_ANNUAL_PRICE_ID' : 'NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID';
      } else if (result.metadata.billingCycle === 'LIFETIME') {
        envVarName = useLiveMode ? 'NEXT_PUBLIC_STRIPE_LIVE_PRO_LIFETIME_PRICE_ID' : 'NEXT_PUBLIC_STRIPE_PRO_LIFETIME_PRICE_ID';
      }
    } else if (result.metadata.planType === 'FREE') {
      envVarName = useLiveMode ? 'NEXT_PUBLIC_STRIPE_LIVE_FREE_PRICE_ID' : 'NEXT_PUBLIC_STRIPE_FREE_PRICE_ID';
    } else if (result.metadata.addonType === 'ADDITIONAL_ORG') {
      if (result.metadata.billingCycle === 'MONTHLY') {
        envVarName = useLiveMode ? 'NEXT_PUBLIC_STRIPE_LIVE_ADDON_ORG_MONTHLY_PRICE_ID' : 'NEXT_PUBLIC_STRIPE_ADDON_ORG_MONTHLY_PRICE_ID';
      } else if (result.metadata.billingCycle === 'ANNUAL') {
        envVarName = useLiveMode ? 'NEXT_PUBLIC_STRIPE_LIVE_ADDON_ORG_ANNUAL_PRICE_ID' : 'NEXT_PUBLIC_STRIPE_ADDON_ORG_ANNUAL_PRICE_ID';
      }
    } else if (result.metadata.addonType === 'ADDITIONAL_MEMBER') {
      if (result.metadata.billingCycle === 'MONTHLY') {
        envVarName = useLiveMode ? 'NEXT_PUBLIC_STRIPE_LIVE_ADDON_MEMBER_MONTHLY_PRICE_ID' : 'NEXT_PUBLIC_STRIPE_ADDON_MEMBER_MONTHLY_PRICE_ID';
      } else if (result.metadata.billingCycle === 'ANNUAL') {
        envVarName = useLiveMode ? 'NEXT_PUBLIC_STRIPE_LIVE_ADDON_MEMBER_ANNUAL_PRICE_ID' : 'NEXT_PUBLIC_STRIPE_ADDON_MEMBER_ANNUAL_PRICE_ID';
      }
    }
    
    if (envVarName) {
      envVars[envVarName] = result.priceId;
      console.log(`${envVarName}="${result.priceId}"`);
    }
  }
  
  console.log('\n--- END ENVIRONMENT VARIABLES ---\n');
  
  // Update the .env.stripe file with the new price IDs
  try {
    const envStripePath = path.resolve(process.cwd(), '.env.stripe');
    let envStripeContent = '';
    
    if (fs.existsSync(envStripePath)) {
      envStripeContent = fs.readFileSync(envStripePath, 'utf8');
    }
    
    // Update or add environment variables to .env.stripe
    for (const [key, value] of Object.entries(envVars)) {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (regex.test(envStripeContent)) {
        // Update existing variable
        envStripeContent = envStripeContent.replace(regex, `${key}="${value}"`);
      } else {
        // Add new variable
        envStripeContent += `\n${key}="${value}"`;
      }
    }
    
    // Write updated content back to .env.stripe
    fs.writeFileSync(envStripePath, envStripeContent.trim() + '\n');
    console.log('Updated .env.stripe with new price IDs');
  } catch (error) {
    console.error('Error updating .env.stripe:', error.message);
  }
  
  // Also update .env.local file with the new price IDs
  try {
    const envLocalPath = path.resolve(process.cwd(), '.env.local');
    let envLocalContent = '';
    
    if (fs.existsSync(envLocalPath)) {
      envLocalContent = fs.readFileSync(envLocalPath, 'utf8');
    }
    
    // Update or add environment variables to .env.local
    for (const [key, value] of Object.entries(envVars)) {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (regex.test(envLocalContent)) {
        // Update existing variable
        envLocalContent = envLocalContent.replace(regex, `${key}="${value}"`);
      } else {
        // Add new variable
        envLocalContent += `\n${key}="${value}"`;
      }
    }
    
    // Write updated content back to .env.local
    fs.writeFileSync(envLocalPath, envLocalContent.trim() + '\n');
    console.log('Updated .env.local with new price IDs');
  } catch (error) {
    console.error('Error updating .env.local:', error.message);
  }
}

main()
  .catch(error => {
    console.error('Error setting up Stripe plans:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Done!');
  });
