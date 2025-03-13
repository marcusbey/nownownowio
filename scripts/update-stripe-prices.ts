const Stripe = require('stripe');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.stripe file
const envPath = path.resolve(process.cwd(), '.env.stripe');
if (!fs.existsSync(envPath)) {
  console.error('.env.stripe file not found. Please create it with your Stripe API keys.');
  process.exit(1);
}

dotenv.config({ path: envPath });

// Determine whether to use live or test mode
const useLiveMode = process.env.USE_LIVE_MODE === 'true';
const stripeSecretKey = useLiveMode 
  ? process.env.STRIPE_LIVE_SECRET_KEY 
  : process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error(`Missing ${useLiveMode ? 'STRIPE_LIVE_SECRET_KEY' : 'STRIPE_SECRET_KEY'} in .env.stripe file`);
  process.exit(1);
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
});

/**
 * Archives all existing active products and their prices in Stripe
 */
async function archiveExistingProducts() {
  try {
    // eslint-disable-next-line no-console
    console.log('Fetching existing active products...');
    const existingProducts = await stripe.products.list({
      active: true,
      limit: 100
    });
    
    // eslint-disable-next-line no-console
    console.log(`Found ${existingProducts.data.length} active products.`);
    
    // Process all products sequentially
    for (const product of existingProducts.data) {
      // eslint-disable-next-line no-console
      console.log(`Processing product: ${product.name} (${product.id})`);
      
      // Get all active prices for this product
      const prices = await stripe.prices.list({
        product: product.id,
        active: true,
        limit: 100
      });
      
      if (prices.data.length > 0) {
        // eslint-disable-next-line no-console
        console.log(`  Found ${prices.data.length} active prices to archive`);
        
        // Archive all prices in parallel
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const archivePromises = prices.data.map((price: any) => {
          // eslint-disable-next-line no-console
          console.log(`  Archiving price: ${price.id}`);
          return stripe.prices.update(price.id, { active: false });
        });
        
        await Promise.all(archivePromises);
      }
      
      // Archive the product instead of deleting it
      // eslint-disable-next-line no-console
      console.log(`  Archiving product: ${product.name} (${product.id})`);
      await stripe.products.update(product.id, { active: false });
    }
    
    // eslint-disable-next-line no-console
    console.log('All existing products have been archived.');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error archiving existing products:', error);
    throw error;
  }
}

// Plan definitions based on the pricing structure
const plans = [
  // Basic Plans
  {
    id: 'BASIC_MONTHLY',
    name: 'Basic Plan',
    description: 'Perfect for individuals and small teams',
    amount: 1400, // $14.00
    interval: 'month',
    trial_period_days: 7,
    features: [
      '1 organization/widget',
      'Unlimited posts & views',
      '1 team member',
      '"Powered by NowNowNow" branding',
      'Basic post management',
      '7-day free trial'
    ],
    metadata: {
      planType: 'BASIC',
      billingCycle: 'MONTHLY'
    }
  },
  {
    id: 'BASIC_ANNUAL',
    name: 'Basic Plan',
    description: 'Perfect for individuals and small teams, billed annually (save 20%)',
    amount: 13400, // $134.00 ($11.17/month)
    interval: 'year',
    trial_period_days: 7,
    features: [
      '1 organization/widget',
      'Unlimited posts & views',
      '1 team member',
      '"Powered by NowNowNow" branding',
      'Basic post management',
      'Save $34 compared to monthly billing',
      '7-day free trial'
    ],
    metadata: {
      planType: 'BASIC',
      billingCycle: 'ANNUAL'
    }
  },
  {
    id: 'BASIC_LIFETIME',
    name: 'Basic Plan',
    description: 'Perfect for individuals and small teams, one-time payment',
    amount: 29900, // $299.00
    interval: null, // One-time payment
    features: [
      '1 organization/widget',
      'Unlimited posts & views',
      '1 team member',
      '"Powered by NowNowNow" branding',
      'Basic post management',
      'Equivalent to ~21 months of subscription',
      'Never pay again'
    ],
    metadata: {
      planType: 'BASIC',
      billingCycle: 'LIFETIME'
    }
  },
  // Pro Plans
  {
    id: 'PRO_MONTHLY',
    name: 'Pro Plan',
    description: 'Perfect for growing teams and businesses',
    amount: 2900, // $29.00
    interval: 'month',
    trial_period_days: 7,
    features: [
      '5 organizations/widgets',
      'Unlimited posts & views',
      '5 team members',
      'Optional branding removal',
      'Advanced analytics',
      'User chat functionality',
      'Priority access to new features',
      '7-day free trial'
    ],
    metadata: {
      planType: 'PRO',
      billingCycle: 'MONTHLY'
    }
  },
  {
    id: 'PRO_ANNUAL',
    name: 'Pro Plan',
    description: 'Perfect for growing teams and businesses, billed annually (save 20%)',
    amount: 27800, // $278.00 ($23.17/month)
    interval: 'year',
    trial_period_days: 7,
    features: [
      '5 organizations/widgets',
      'Unlimited posts & views',
      '5 team members',
      'Optional branding removal',
      'Advanced analytics',
      'User chat functionality',
      'Priority access to new features',
      'Save $70 compared to monthly billing',
      '7-day free trial'
    ],
    metadata: {
      planType: 'PRO',
      billingCycle: 'ANNUAL'
    }
  },
  {
    id: 'PRO_LIFETIME',
    name: 'Pro Plan',
    description: 'Perfect for growing teams and businesses, one-time payment',
    amount: 59900, // $599.00
    interval: null, // One-time payment
    features: [
      '5 organizations/widgets',
      'Unlimited posts & views',
      '5 team members',
      'Optional branding removal',
      'Advanced analytics',
      'User chat functionality',
      'Priority access to new features',
      'Equivalent to ~21 months of subscription',
      'Never pay again'
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
      '1 organization/widget',
      'Unlimited posts & views',
      '1 team member',
      '"Powered by NowNowNow" branding',
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
    name: 'Additional Organization',
    description: 'Add an additional organization to your plan',
    amount: 900, // $9.00
    interval: 'month',
    features: [
      'One additional organization/widget',
      'Unlimited posts & views',
      'Same premium features as the base plan'
    ],
    metadata: {
      addonType: 'ADDITIONAL_ORG',
      billingCycle: 'MONTHLY'
    }
  },
  {
    id: 'ADDITIONAL_ORG_ANNUAL',
    name: 'Additional Organization',
    description: 'Add an additional organization to your plan, billed annually',
    amount: 8600, // $86.00
    interval: 'year',
    features: [
      'One additional organization/widget',
      'Unlimited posts & views',
      'Same premium features as the base plan',
      '20% savings compared to monthly billing'
    ],
    metadata: {
      addonType: 'ADDITIONAL_ORG',
      billingCycle: 'ANNUAL'
    }
  },
  {
    id: 'ADDITIONAL_ORG_LIFETIME',
    name: 'Additional Organization',
    description: 'Add an additional organization to your plan, one-time payment',
    amount: 19900, // $199.00
    interval: null, // One-time payment
    features: [
      'One additional organization/widget',
      'Unlimited posts & views',
      'Same premium features as the base plan',
      'Never pay again'
    ],
    metadata: {
      addonType: 'ADDITIONAL_ORG',
      billingCycle: 'LIFETIME'
    }
  },
  {
    id: 'ADDITIONAL_MEMBER_MONTHLY',
    name: 'Additional Team Member',
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
    name: 'Additional Team Member',
    description: 'Add an additional team member to your plan, billed annually',
    amount: 4800, // $48.00
    interval: 'year',
    features: [
      'One additional team member',
      'All features of your current plan',
      '20% savings compared to monthly billing'
    ],
    metadata: {
      addonType: 'ADDITIONAL_MEMBER',
      billingCycle: 'ANNUAL'
    }
  },
  {
    id: 'ADDITIONAL_MEMBER_LIFETIME',
    name: 'Additional Team Member',
    description: 'Add an additional team member to your plan, one-time payment',
    amount: 9900, // $99.00
    interval: null, // One-time payment
    features: [
      'One additional team member',
      'All features of your current plan',
      'Never pay again'
    ],
    metadata: {
      addonType: 'ADDITIONAL_MEMBER',
      billingCycle: 'LIFETIME'
    }
  }
];

/**
 * Creates a new Stripe product and price
 */
// Define metadata types with string values only for Stripe compatibility
type PlanMetadataFields = {
  planType?: string;
  billingCycle?: string;
  addonType?: string;
};

type PlanMetadata = PlanMetadataFields & Record<string, string>;

// Raw plan data from the plans array
type RawPlan = {
  id: string;
  name: string;
  description: string;
  amount: number;
  interval: string | null;
  trial_period_days?: number;
  features: string[];
  metadata?: Partial<PlanMetadata>;
};

type Plan = {
  id: string;
  name: string;
  description: string;
  amount: number;
  interval: string | null;
  trial_period_days?: number;
  features: string[];
  metadata: PlanMetadata;
}

async function createOrUpdateProduct(plan: Plan) {
  try {
    // Create a new product for each plan
    let productName = plan.name;
    
    // Add billing cycle to product name for better organization in Stripe dashboard
    if (plan.metadata.billingCycle === 'MONTHLY') {
      productName += ' Monthly';
    } else if (plan.metadata.billingCycle === 'ANNUAL') {
      productName += ' Annual';
    } else if (plan.metadata.billingCycle === 'LIFETIME') {
      productName += ' Lifetime';
    }
    
    // eslint-disable-next-line no-console
    console.log(`Creating new product: ${productName}`);
    const product = await stripe.products.create({
      name: productName,
      description: plan.description,
      metadata: Object.fromEntries(
        Object.entries(plan.metadata).filter(([_, value]) => value !== undefined)
      ) as Record<string, string>
    });
    
    // Create a new price for the product
    const priceParams: {
      product: string;
      unit_amount: number;
      currency: string;
      metadata: Record<string, string>;
      recurring?: {
        interval: string;
        trial_period_days?: number;
      };
    } = {
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
    
    // eslint-disable-next-line no-console
    console.log(`Created price: ${price.id} (${plan.amount / 100} USD ${plan.interval ?? 'one-time'})`);
    
    return {
      planId: plan.id,
      productId: product.id,
      priceId: price.id,
      metadata: Object.fromEntries(
        Object.entries(plan.metadata).filter(([_, value]) => value !== undefined)
      ) as Record<string, string>
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error creating product/price for ${plan.name}:`, error);
    throw error;
  }
}

async function main() {
  // eslint-disable-next-line no-console
  console.log(`Setting up Stripe plans in ${useLiveMode ? 'LIVE' : 'TEST'} mode...`);
  
  // First archive all existing products
  await archiveExistingProducts();
  
  const results = [];
  
  // Process each plan and ensure it has the correct metadata structure
  const typedPlans = (plans as RawPlan[]).map(plan => {
    // Add metadata if it doesn't exist
    const planWithMetadata = {
      ...plan,
      metadata: plan.metadata ?? {}
    };
    
    // Ensure all metadata values are strings
    const cleanMetadata = Object.fromEntries(
      Object.entries(planWithMetadata.metadata).filter(([_, value]) => value !== undefined)
    );
    
    return {
      ...planWithMetadata,
      metadata: cleanMetadata as PlanMetadata
    };
  }) as Plan[];

  // Process plans in sequence to avoid race conditions
  for (const plan of typedPlans) {
    try {
      const result = await createOrUpdateProduct(plan);
      results.push(result);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Failed to process plan ${plan.id}:`, error);
      // Continue with other plans even if one fails
    }
  }
  
  // eslint-disable-next-line no-console
  console.log('\n\n--- ENVIRONMENT VARIABLES TO ADD ---\n');
  
  // Generate environment variables
  const envVars: Record<string, string> = {};
  
  for (const result of results) {
    let envVarName;
    
    if (result.metadata.planType === 'BASIC') {
      if (result.metadata.billingCycle === 'MONTHLY') {
        envVarName = 'NEXT_PUBLIC_STRIPE_BASIC_MONTHLY_PRICE_ID';
      } else if (result.metadata.billingCycle === 'ANNUAL') {
        envVarName = 'NEXT_PUBLIC_STRIPE_BASIC_ANNUAL_PRICE_ID';
      } else if (result.metadata.billingCycle === 'LIFETIME') {
        envVarName = 'NEXT_PUBLIC_STRIPE_BASIC_LIFETIME_PRICE_ID';
      }
    } else if (result.metadata.planType === 'PRO') {
      if (result.metadata.billingCycle === 'MONTHLY') {
        envVarName = 'NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID';
      } else if (result.metadata.billingCycle === 'ANNUAL') {
        envVarName = 'NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID';
      } else if (result.metadata.billingCycle === 'LIFETIME') {
        envVarName = 'NEXT_PUBLIC_STRIPE_PRO_LIFETIME_PRICE_ID';
      }
    } else if (result.metadata.planType === 'FREE') {
      envVarName = 'NEXT_PUBLIC_STRIPE_FREE_PRICE_ID';
    } else if (result.metadata.addonType === 'ADDITIONAL_ORG') {
      if (result.metadata.billingCycle === 'MONTHLY') {
        envVarName = 'NEXT_PUBLIC_STRIPE_ADDON_ORG_MONTHLY_PRICE_ID';
      } else if (result.metadata.billingCycle === 'ANNUAL') {
        envVarName = 'NEXT_PUBLIC_STRIPE_ADDON_ORG_ANNUAL_PRICE_ID';
      } else if (result.metadata.billingCycle === 'LIFETIME') {
        envVarName = 'NEXT_PUBLIC_STRIPE_ADDON_ORG_LIFETIME_PRICE_ID';
      }
    } else if (result.metadata.addonType === 'ADDITIONAL_MEMBER') {
      if (result.metadata.billingCycle === 'MONTHLY') {
        envVarName = 'NEXT_PUBLIC_STRIPE_ADDON_MEMBER_MONTHLY_PRICE_ID';
      } else if (result.metadata.billingCycle === 'ANNUAL') {
        envVarName = 'NEXT_PUBLIC_STRIPE_ADDON_MEMBER_ANNUAL_PRICE_ID';
      } else if (result.metadata.billingCycle === 'LIFETIME') {
        envVarName = 'NEXT_PUBLIC_STRIPE_ADDON_MEMBER_LIFETIME_PRICE_ID';
      }
    }
    
    if (envVarName) {
      envVars[envVarName] = result.priceId;
      // eslint-disable-next-line no-console
      console.log(`${envVarName}="${result.priceId}"`);
    }
  }
  
  // eslint-disable-next-line no-console
  console.log('\n--- END ENVIRONMENT VARIABLES ---\n');
  
  // Update fallback-prices.ts with the new price IDs
  await updateFallbackPricesFile(envVars);
}

async function updateFallbackPricesFile(envVars: Record<string, string>) {
  const fallbackPricesPath = path.resolve(process.cwd(), 'src/features/billing/plans/fallback-prices.ts');
  
  if (!fs.existsSync(fallbackPricesPath)) {
    // eslint-disable-next-line no-console
    console.error('fallback-prices.ts file not found.');
    return;
  }
  
  let content = fs.readFileSync(fallbackPricesPath, 'utf8');
  
  // Update the price IDs in the fallback-prices.ts file
  if (envVars.NEXT_PUBLIC_STRIPE_BASIC_MONTHLY_PRICE_ID) {
    content = content.replace(
      /priceId: "price_1QzYbI00GvYcfU0MBsWqwG00"/g, 
      `priceId: "${envVars.NEXT_PUBLIC_STRIPE_BASIC_MONTHLY_PRICE_ID}"`
    );
  }
  
  if (envVars.NEXT_PUBLIC_STRIPE_BASIC_ANNUAL_PRICE_ID) {
    content = content.replace(
      /priceId: "price_1QzYbJ00GvYcfU0Mqcv86bkd"/g, 
      `priceId: "${envVars.NEXT_PUBLIC_STRIPE_BASIC_ANNUAL_PRICE_ID}"`
    );
  }
  
  if (envVars.NEXT_PUBLIC_STRIPE_BASIC_LIFETIME_PRICE_ID) {
    content = content.replace(
      /priceId: "price_1QzYbJ00GvYcfU0MdGUvVrrF"/g, 
      `priceId: "${envVars.NEXT_PUBLIC_STRIPE_BASIC_LIFETIME_PRICE_ID}"`
    );
  }
  
  if (envVars.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID) {
    content = content.replace(
      /priceId: "price_1QzYbJ00GvYcfU0MJ9DAV1fT"/g, 
      `priceId: "${envVars.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID}"`
    );
  }
  
  if (envVars.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID) {
    content = content.replace(
      /priceId: "price_1QzYbK00GvYcfU0MlDlgfKHA"/g, 
      `priceId: "${envVars.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID}"`
    );
  }
  
  if (envVars.NEXT_PUBLIC_STRIPE_PRO_LIFETIME_PRICE_ID) {
    content = content.replace(
      /priceId: "price_1QzYbK00GvYcfU0MSApINROv"/g, 
      `priceId: "${envVars.NEXT_PUBLIC_STRIPE_PRO_LIFETIME_PRICE_ID}"`
    );
  }
  
  if (envVars.NEXT_PUBLIC_STRIPE_FREE_PRICE_ID) {
    content = content.replace(
      /priceId: "price_1QzYDJ00GvYcfU0MjEsFp4Md"/g, 
      `priceId: "${envVars.NEXT_PUBLIC_STRIPE_FREE_PRICE_ID}"`
    );
  }
  
  // Create a backup of the original file
  fs.writeFileSync(`${fallbackPricesPath}.backup`, fs.readFileSync(fallbackPricesPath));
  
  // Write the updated content
  fs.writeFileSync(fallbackPricesPath, content);
  
  // eslint-disable-next-line no-console
  console.log('Updated fallback-prices.ts with new price IDs');
  // eslint-disable-next-line no-console
  console.log('A backup of the original file has been created at fallback-prices.ts.backup');
}

main()
  .catch(error => {
    // eslint-disable-next-line no-console
    console.error('Error setting up Stripe plans:', error);
    process.exit(1);
  })
  .finally(() => {
    // eslint-disable-next-line no-console
    console.log('Done!');
  });
