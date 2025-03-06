"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { PLANS, BillingCycle, PlanType } from "./plans";
import { PricingCard } from "./pricing-card";

interface PricingSectionProps {
  defaultBillingCycle?: BillingCycle;
  showFreeOnly?: boolean;
  showPaidOnly?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
  compact?: boolean;
}

export const PricingCards = ({ compact = false }: { compact?: boolean }) => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [showLifetime, setShowLifetime] = useState(false);

  // Get the basic and pro plans based on the selected billing cycle
  const selectedCycle: BillingCycle = isAnnual ? "ANNUAL" : "MONTHLY";
  const basicPlan = PLANS.find(plan => plan.planType === "BASIC" && plan.billingCycle === selectedCycle);
  const proPlan = PLANS.find(plan => plan.planType === "PRO" && plan.billingCycle === selectedCycle);

  return (
    <div className={`w-full ${compact ? 'max-w-full' : 'max-w-4xl mx-auto py-12'} px-4`}>
      {!compact && (
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include our core widget functionality.
          </p>
          
          <div className="mt-6 inline-flex items-center p-1 bg-gray-100 rounded-lg">
            <button 
              className={`px-4 py-2 rounded-md transition-all ${!isAnnual ? 'bg-white shadow-sm' : ''}`}
              onClick={() => setIsAnnual(false)}
            >
              Monthly
            </button>
            <button 
              className={`px-4 py-2 rounded-md transition-all ${isAnnual ? 'bg-white shadow-sm' : ''}`}
              onClick={() => setIsAnnual(true)}
            >
              Annual (20% off)
            </button>
          </div>
        </div>
      )}
      
      {compact && (
        <div className="flex justify-end mb-6">
          <div className="inline-flex items-center p-1 bg-gray-100 rounded-lg">
            <button 
              className={`px-3 py-1 text-sm rounded-md transition-all ${!isAnnual ? 'bg-white shadow-sm' : ''}`}
              onClick={() => setIsAnnual(false)}
            >
              Monthly
            </button>
            <button 
              className={`px-3 py-1 text-sm rounded-md transition-all ${isAnnual ? 'bg-white shadow-sm' : ''}`}
              onClick={() => setIsAnnual(true)}
            >
              Annual
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Plan */}
        {basicPlan && (
          <PricingCard
            {...basicPlan}
            selectedBillingCycle={selectedCycle}
            showBillingToggle={false}
          />
        )}

        {/* Pro Plan */}
        {proPlan && (
          <PricingCard
            {...proPlan}
            selectedBillingCycle={selectedCycle}
            showBillingToggle={false}
            isRecommended={true}
          />
        )}
      </div>

      <div className="mt-16 text-center">
        <h3 className="text-xl font-semibold mb-4">All Plans Include</h3>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mt-6">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            <span>Easy widget embedding</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            <span>Status updates</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            <span>Community support</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            <span>Responsive widgets</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            <span>SSL security</span>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-600">Not sure which plan to choose?</p>
        <button className="mt-2 text-blue-600 font-medium hover:underline">Contact us for help</button>
      </div>
    </div>
  );
};

// For backward compatibility, keep a simplified version of the original Pricing component
export const Pricing = ({
  defaultBillingCycle = "MONTHLY",
  showFreeOnly = false,
  showPaidOnly = false,
  title = "Pricing",
  subtitle = "Choose the best plan for your needs",
  className,
}: PricingSectionProps) => {
  return <PricingCards />;
};

// For backward compatibility
export const ClientPricingSection = ({ variant }: { variant?: string }) => {
  return <PricingCards compact={variant === "compact"} />;
};
