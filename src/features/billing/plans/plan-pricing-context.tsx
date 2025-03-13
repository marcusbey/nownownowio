import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { FALLBACK_PRICES, getFallbackPriceAmount, getFallbackPriceId } from "./fallback-prices";

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

interface PlanPricingContextType {
  prices: PlanPrice[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getPriceAmount: (planType: string, billingCycle: string) => number;
  getPriceId: (planType: string, billingCycle: string) => string | undefined;
}

const PlanPricingContext = createContext<PlanPricingContextType | undefined>(undefined);

interface PlanPricingProviderProps {
  children: ReactNode;
}

export function PlanPricingProvider({ children }: PlanPricingProviderProps): JSX.Element {
  const [prices, setPrices] = useState<PlanPrice[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const response = await fetch("/api/v1/payments/plan-prices", {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          // Log the error but don't throw - we'll use fallback prices
          // Log error and set error state
          setError(`Unable to fetch prices (${response.status}). Using fallback prices.`);
          return; // Exit early but don't throw - we'll use fallbacks
        }
        
        const data = await response.json();
        
        if (data.prices && Array.isArray(data.prices) && data.prices.length > 0) {
          setPrices(data.prices);
        } else {
          // No price data available
          setError("Using fallback pricing data");
        }
      } catch (fetchError) {
        // Handle fetch-specific errors (timeout, network issues, etc.)
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
          setError('Request timed out. Using fallback prices.');
        } else {
          setError('Network error. Using fallback prices.');
        }
        clearTimeout(timeoutId);
      }
    } catch (err) {
      // Handle any other errors in the outer try block
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchPrices();
  }, []);

  // Helper function to get price amount for a specific plan type and billing cycle
  const getPriceAmount = (planType: string, billingCycle: string): number => {
    const price = prices.find(
      p => p.type.toUpperCase() === planType.toUpperCase() && 
           p.billingCycle.toUpperCase() === billingCycle.toUpperCase()
    );
    
    // Use the price from API if available, otherwise use fallback
    return price?.unitAmount ?? getFallbackPriceAmount(planType, billingCycle);
  };

  // Helper function to get price ID for a specific plan type and billing cycle
  const getPriceId = (planType: string, billingCycle: string): string | undefined => {
    const price = prices.find(
      p => p.type.toUpperCase() === planType.toUpperCase() && 
           p.billingCycle.toUpperCase() === billingCycle.toUpperCase()
    );
    
    // Use the price ID from API if available, otherwise use fallback
    return price?.id ?? getFallbackPriceId(planType, billingCycle);
  };

  const value = {
    prices,
    isLoading,
    error,
    refetch: fetchPrices,
    getPriceAmount,
    getPriceId
  };

  return (
    <PlanPricingContext.Provider value={value}>
      {children}
    </PlanPricingContext.Provider>
  );
}

export function usePlanPricing(): PlanPricingContextType {
  const context = useContext(PlanPricingContext);
  
  if (context === undefined) {
    throw new Error("usePlanPricing must be used within a PlanPricingProvider");
  }
  
  return context;
}

// Export fallback prices from the centralized file
export { FALLBACK_PRICES };
