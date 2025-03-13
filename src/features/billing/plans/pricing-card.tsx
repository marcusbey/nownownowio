"use client";

import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { BuyButton } from "@/features/billing/payments/buy-button";
import type { Plan, BillingCycle } from "./plans";
import { usePlanPricing } from "./plan-pricing-context";
import { FALLBACK_PRICES } from "./fallback-prices";
import { env } from "@/lib/env";

type PricingCardProps = Plan & {
  onSelectBillingCycle?: (billingCycle: BillingCycle) => void;
  selectedBillingCycle?: BillingCycle;
  showBillingToggle?: boolean;
  isRecommended?: boolean;
  className?: string;
  isPopular?: boolean;
}

export const PricingCard = (props: PricingCardProps) => {
  const params = useParams();
  const organizationSlug = params.orgSlug ? params.orgSlug : "";
  const [showLifetime, setShowLifetime] = useState(false);
  const { getPriceAmount } = usePlanPricing();
  
  // Determine if we're using live or test mode
  const useLiveMode = env.USE_LIVE_MODE === 'true';
  
  // Get the appropriate price based on billing cycle
  const getPrice = (): number => {
    // If the price is provided in props, use it; otherwise, get it from the context
    if (props.price !== undefined) return Math.round(props.price);
    
    // Use the pricing context to get the price or fall back to the centralized fallback prices
    let price = 0;
    
    if (props.planType && props.billingCycle) {
      // First try to get price from context
      price = getPriceAmount(props.planType, props.billingCycle);
      
      // If not available, use fallback
      if (price === 0 && props.planType && props.billingCycle) {
        // Access fallback prices safely with proper type checking
        const planType = props.planType as keyof typeof FALLBACK_PRICES;
        if (planType in FALLBACK_PRICES) {
          const plan = FALLBACK_PRICES[planType];
          const billingCycle = props.billingCycle as string;
          if (billingCycle in plan) {
            const fallbackPrice = plan[billingCycle as keyof typeof plan];
            price = fallbackPrice.amount || 0;
          }
        }
      }
    }
    
    return Math.round(price);
  };
  
  // Get the appropriate price ID based on the plan type and billing cycle
  const getPriceId = (): string => {
    // Early return with empty string if we don't have the required properties
    // This is a safeguard, though props.planType and props.billingCycle should always be defined
    if (typeof props.planType === 'undefined' || typeof props.billingCycle === 'undefined') return '';
    
    // If priceId is explicitly provided in props, use it
    if (props.priceId) return props.priceId;
    
    // Otherwise, determine the price ID based on the environment mode (live/test)
    const modePrefix = useLiveMode ? 'LIVE' : 'TEST';
    const envVarName = `NEXT_PUBLIC_STRIPE_${modePrefix}_${props.planType}_${props.billingCycle}_PRICE_ID`;
    
    // Access the appropriate environment variable
    const envValue = env[envVarName as keyof typeof env];
    if (envValue) return envValue;
    
    // At this point, we know props.planType and props.billingCycle are defined
    // because we've already checked them in the early return statement above
    
    // We've already checked that props.planType and props.billingCycle are defined
    // in the early return statement above, so we can safely use them here
    try {
      const planType = props.planType as keyof typeof FALLBACK_PRICES;
      
      if (planType in FALLBACK_PRICES) {
        const plan = FALLBACK_PRICES[planType];
        const billingCycle = props.billingCycle as keyof typeof plan;
        
        if (billingCycle in plan) {
          const fallbackPrice = plan[billingCycle];
          return fallbackPrice.priceId || '';
        }
      }
      return '';
    } catch {
      // If any errors occur during access, return empty string
      return '';
    }
  };

  // Format price to ensure it's always a whole number
  const formatPrice = (price: number) => {
    return Math.round(price);
  };

  // Get the appropriate lifetime price for the plan type
  const getLifetimePrice = (): number => {
    if (props.planType === "BASIC") {
      const price = getPriceAmount("BASIC", "LIFETIME");
      return price || FALLBACK_PRICES.BASIC.LIFETIME.amount || 0;
    }
    if (props.planType === "PRO") {
      const price = getPriceAmount("PRO", "LIFETIME");
      return price || FALLBACK_PRICES.PRO.LIFETIME.amount || 0;
    }
    return 0;
  };

  // Get the billing label
  const getBillingLabel = () => {
    if (props.billingCycle === "MONTHLY") return "/month";
    if (props.billingCycle === "ANNUAL") return "/mo";
    // For LIFETIME billing cycle
    return " (lifetime)";
  };

  // Get annual billing amount if applicable
  const getAnnualBillingAmount = () => {
    if (props.billingCycle === "ANNUAL" && props.price) {
      return props.price * 12;
    }
    return null;
  };

  const cardClasses = cn(
    props.className ?? "bg-white rounded-lg overflow-hidden border transition-all hover:shadow-xl",
    {
      "shadow-lg border-gray-200": !props.isRecommended,
      "shadow-xl border-2 border-blue-500": props.isRecommended
    }
  );

  return (
    <div 
      className={cardClasses}
      onMouseEnter={() => setShowLifetime(true)}
      onMouseLeave={() => setShowLifetime(false)}
    >
      {props.isRecommended && (
        <div className="bg-blue-500 py-2 text-center">
          <span className="text-white text-sm font-semibold uppercase tracking-wide">Recommended</span>
        </div>
      )}
      
      {props.isPopular && (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 py-2 text-center">
          <span className="text-white text-sm font-semibold uppercase tracking-wide">Popular</span>
        </div>
      )}
      
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-900">{props.name}</h3>
        <div className="mt-4 flex items-baseline">
          <span className="text-4xl font-extrabold">${formatPrice(getPrice() || 0)}</span>
          <span className="ml-1 text-xl text-gray-500">{getBillingLabel()}</span>
        </div>
        
        {props.billingCycle === "ANNUAL" && (
          <p className="mt-1 text-sm text-green-600">
            ${formatPrice(getAnnualBillingAmount() ?? 0)} billed annually
          </p>
        )}
        
        {showLifetime && props.planType !== "FREE" && (
          <div className="mt-3 rounded-md border border-blue-100 bg-blue-50 p-2">
            <p className="font-medium text-blue-700">Lifetime: ${formatPrice(getLifetimePrice() || 0)}</p>
            <p className="text-xs text-blue-600">One-time payment, lifetime access</p>
          </div>
        )}
        
        <p className="mt-5 text-gray-500">{props.description}</p>
      </div>
      
      <div className="px-6 pt-6 pb-8">
        <ul className="space-y-4">
          {props.features.map((feature, index) => (
            <PricingItem key={index} included={true}>{feature}</PricingItem>
          ))}
          
          {/* Add any non-included features if needed */}
          {props.planType === "FREE" || props.planType === "BASIC" ? (
            <>
              {props.planType === "FREE" && (
                <>
                  <PricingItem included={false}>Remove "Powered by" branding</PricingItem>
                  <PricingItem included={false}>Additional organizations</PricingItem>
                  <PricingItem included={false}>Team members</PricingItem>
                </>
              )}
              {props.planType === "BASIC" && (
                <PricingItem included={false}>Additional team members (beyond 5)</PricingItem>
              )}
            </>
          ) : null}
        </ul>
        
        <div className="mt-8">
          {props.planType === "FREE" ? (
            <button 
              className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
              onClick={() => window.location.href = "/auth/signup"}
            >
              {props.cta ?? "Get Started Free"}
            </button>
          ) : (
            <BuyButton
              orgSlug={String(organizationSlug)}
              priceId={getPriceId()}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
            >
              {showLifetime && props.billingCycle !== "LIFETIME" 
                ? "Get Lifetime Access" 
                : props.cta ?? "Subscribe Now"}
            </BuyButton>
          )}
        </div>
      </div>
    </div>
  );
};

type PricingItemProps = {
  included: boolean;
  children: React.ReactNode;
}

const PricingItem = ({ included, children }: PricingItemProps) => {
  return (
    <li className="flex items-start">
      <div className="shrink-0">
        {included ? (
          <Check className="size-5 text-green-500" />
        ) : (
          <X className="size-5 text-gray-400" />
        )}
      </div>
      <span className={`ml-3 ${included ? 'text-gray-900' : 'line-through text-gray-500'}`}>
        {children}
      </span>
    </li>
  );
};
