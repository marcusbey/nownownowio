"use client";

import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { BuyButton } from "@/features/billing/payments/buy-button";
import type { Plan, BillingCycle } from "./plans";

interface PricingCardProps extends Plan {
  onSelectBillingCycle?: (billingCycle: BillingCycle) => void;
  selectedBillingCycle?: BillingCycle;
  showBillingToggle?: boolean;
  isRecommended?: boolean;
}

export const PricingCard = (props: PricingCardProps) => {
  const params = useParams();
  const organizationSlug = params.orgSlug ? params.orgSlug : "";
  const [showLifetime, setShowLifetime] = useState(false);
  
  // Get the appropriate price based on billing cycle
  const getPrice = () => {
    if (props.billingCycle === "MONTHLY") return props.price;
    if (props.billingCycle === "ANNUAL") return props.price;
    if (props.billingCycle === "LIFETIME") return props.price;
    return 0;
  };

  // Get the appropriate lifetime price for the plan type
  const getLifetimePrice = () => {
    if (props.planType === "BASIC") return 199;
    if (props.planType === "PRO") return 599;
    return 0;
  };

  // Get the billing label
  const getBillingLabel = () => {
    if (props.billingCycle === "MONTHLY") return "/month";
    if (props.billingCycle === "ANNUAL") return "/mo";
    return "";
  };

  // Get annual billing amount if applicable
  const getAnnualBillingAmount = () => {
    if (props.billingCycle === "ANNUAL" && props.price) {
      return props.price * 12;
    }
    return null;
  };

  const cardClasses = cn(
    "bg-white rounded-lg overflow-hidden border transition-all hover:shadow-xl",
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
      
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-900">{props.name}</h3>
        <div className="mt-4 flex items-baseline">
          <span className="text-4xl font-extrabold">${getPrice()}</span>
          <span className="ml-1 text-xl text-gray-500">{getBillingLabel()}</span>
        </div>
        
        {props.billingCycle === "ANNUAL" && (
          <p className="text-sm text-green-600 mt-1">
            ${getAnnualBillingAmount()} billed annually
          </p>
        )}
        
        {showLifetime && props.planType !== "FREE" && (
          <div className="mt-3 p-2 bg-blue-50 rounded-md border border-blue-100">
            <p className="text-blue-700 font-medium">Lifetime: ${getLifetimePrice()}</p>
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
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold w-full py-2 px-4 rounded-lg transition"
              onClick={() => window.location.href = "/auth/signup"}
            >
              {props.cta || "Get Started Free"}
            </button>
          ) : (
            <BuyButton
              orgSlug={String(organizationSlug)}
              priceId={props.priceId}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold w-full py-2 px-4 rounded-lg transition"
            >
              {showLifetime && props.billingCycle !== "LIFETIME" 
                ? "Get Lifetime Access" 
                : props.cta || "Subscribe Now"}
            </BuyButton>
          )}
        </div>
      </div>
    </div>
  );
};

interface PricingItemProps {
  included: boolean;
  children: React.ReactNode;
}

const PricingItem = ({ included, children }: PricingItemProps) => {
  return (
    <li className="flex items-start">
      <div className="flex-shrink-0">
        {included ? (
          <Check className="h-5 w-5 text-green-500" />
        ) : (
          <X className="h-5 w-5 text-gray-400" />
        )}
      </div>
      <span className={`ml-3 ${included ? 'text-gray-900' : 'text-gray-500 line-through'}`}>
        {children}
      </span>
    </li>
  );
};
