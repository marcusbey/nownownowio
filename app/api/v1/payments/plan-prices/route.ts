import { NextResponse } from "next/server";
import { getStripe, listAllPrices, listAllProducts } from "@/lib/stripe";
import { logger } from "@/lib/logger";
import { env } from "@/lib/env";

export interface PlanPrice {
  id: string;
  productId: string;
  productName: string;
  type: string;
  billingCycle: string;
  unitAmount: number;
  currency: string;
  active: boolean;
}

/**
 * GET /api/v1/payments/plan-prices
 * 
 * Fetches all plan prices from Stripe and returns them in a structured format
 * This makes it easier to update pricing without hardcoding values in the frontend
 */
export async function GET() {
  try {
    // Determine if we're using live or test mode
    const useLiveMode = env.USE_LIVE_MODE === 'true';
    const modePrefix = useLiveMode ? 'Live' : 'Test';
    
    logger.info(`Fetching ${modePrefix} mode prices from Stripe`);
    
    const stripe = await getStripe();
    
    // Fetch all products and prices in parallel
    const [productsResponse, pricesResponse] = await Promise.all([
      listAllProducts(),
      listAllPrices()
    ]);
    
    const products = productsResponse.data;
    const prices = pricesResponse.data;
    
    // Create a map of product IDs to product names for easier lookup
    const productMap = new Map();
    products.forEach(product => {
      if (product.active) {
        productMap.set(product.id, {
          name: product.name,
          metadata: product.metadata
        });
      }
    });
    
    // Format the prices with product information
    const formattedPrices: PlanPrice[] = prices
      .filter(price => price.active && productMap.has(price.product as string))
      .map(price => {
        const product = productMap.get(price.product as string);
        const metadata = price.metadata || {};
        const productMetadata = product.metadata || {};
        
        // Extract plan type and billing cycle from metadata
        const planType = metadata.planType || productMetadata.planType || "UNKNOWN";
        const billingCycle = metadata.billingCycle || price.recurring?.interval?.toUpperCase() || "UNKNOWN";
        
        return {
          id: price.id,
          productId: price.product as string,
          productName: product.name,
          type: planType,
          billingCycle: billingCycle,
          unitAmount: price.unit_amount ? price.unit_amount / 100 : 0, // Convert cents to dollars
          currency: price.currency.toUpperCase(),
          active: price.active
        };
      });
    
    return NextResponse.json({ prices: formattedPrices });
  } catch (error) {
    const useLiveMode = env.USE_LIVE_MODE === 'true';
    const modePrefix = useLiveMode ? 'Live' : 'Test';
    
    logger.error(`Error fetching ${modePrefix} mode plan prices from Stripe`, { error });
    
    return NextResponse.json(
      { 
        error: "Failed to fetch plan prices", 
        message: env.NODE_ENV === "development" 
          ? `${error instanceof Error ? error.message : "Unknown error"}` 
          : "An error occurred while fetching plan prices"
      }, 
      { status: 500 }
    );
  }
}
