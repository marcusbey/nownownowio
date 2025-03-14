import { NextResponse } from "next/server";
import { getStripe, listAllPrices, listAllProducts } from "@/lib/stripe";
import { logger } from "@/lib/logger";
import { env } from "@/lib/env";

export type PlanPrice = {
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
import { FALLBACK_PRICES } from "@/features/billing/plans/fallback-prices";

export async function GET() {
  try {
    // Determine if we're using live or test mode
    const useLiveMode = env.USE_LIVE_MODE === 'true';
    const modePrefix = useLiveMode ? 'Live' : 'Test';
    
    logger.info(`Fetching ${modePrefix} mode prices from Stripe`);
    
    try {
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
          const billingCycle = metadata.billingCycle || price.recurring?.interval.toUpperCase() || "UNKNOWN";
          
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
      
      if (formattedPrices.length > 0) {
        return NextResponse.json({ prices: formattedPrices });
      }
      
      // If we got no prices from Stripe, use fallbacks
      logger.warn("No prices returned from Stripe API, using fallback prices");
      throw new Error("No prices returned from Stripe API");
      
    } catch (stripeError) {
      // Handle Stripe API errors by using fallback prices
      logger.warn(`Using fallback prices due to Stripe API error: ${stripeError instanceof Error ? stripeError.message : 'Unknown error'}`);
      
      // Convert fallback prices to the expected format
      const fallbackPricesFormatted: PlanPrice[] = [];
      
      // Iterate through the FALLBACK_PRICES object to format them like the API response
      Object.entries(FALLBACK_PRICES).forEach(([planType, billingCycles]) => {
        Object.entries(billingCycles).forEach(([billingCycle, priceInfo]) => {
          fallbackPricesFormatted.push({
            id: priceInfo.priceId || `fallback_${planType}_${billingCycle}`,
            productId: `fallback_product_${planType}`,
            productName: `${planType.charAt(0) + planType.slice(1).toLowerCase()} Plan`,
            type: planType,
            billingCycle: billingCycle,
            unitAmount: priceInfo.amount,
            currency: "USD",
            active: true
          });
        });
      });
      
      return NextResponse.json({ 
        prices: fallbackPricesFormatted,
        usingFallback: true,
        message: "Using fallback prices due to Stripe API error"
      });
    }
    
  } catch (error) {
    const useLiveMode = env.USE_LIVE_MODE === 'true';
    const modePrefix = useLiveMode ? 'Live' : 'Test';
    
    logger.error(`Error in plan prices API route: ${modePrefix} mode`, { error });
    
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
