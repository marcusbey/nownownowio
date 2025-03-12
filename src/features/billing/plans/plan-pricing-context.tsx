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
      
      const response = await fetch("/api/v1/payments/plan-prices");
      
      if (!response.ok) {
        throw new Error(`Error fetching prices: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.prices) {
        setPrices(data.prices);
      } else {
        setError("No price data available");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      console.error("Error fetching plan prices:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  // Helper function to get price amount for a specific plan type and billing cycle
  const getPriceAmount = (planType: string, billingCycle: string): number => {
    const price = prices.find(
      p => p.type.toUpperCase() === planType.toUpperCase() && 
           p.billingCycle.toUpperCase() === billingCycle.toUpperCase()
    );
    
    // Use the price from API if available, otherwise use fallback
    return price?.unitAmount || getFallbackPriceAmount(planType, billingCycle);
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
