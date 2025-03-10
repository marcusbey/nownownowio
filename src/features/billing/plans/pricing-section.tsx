"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { PLANS } from "./plans";
import type { BillingCycle } from "./plans";
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

  // Get the basic and pro plans based on the selected billing cycle
  const selectedCycle: BillingCycle = isAnnual ? "ANNUAL" : "MONTHLY";
  const basicPlan = PLANS.find(plan => plan.planType === "BASIC" && plan.billingCycle === selectedCycle);
  const proPlan = PLANS.find(plan => plan.planType === "PRO" && plan.billingCycle === selectedCycle);
  
  // Get lifetime plans
  const basicLifetimePlan = PLANS.find(plan => plan.id === "BASIC_LIFETIME");
  const proLifetimePlan = PLANS.find(plan => plan.id === "PRO_LIFETIME");

  return (
    <div className="container relative z-10">


    <div className={`w-full ${compact ? 'max-w-full' : 'mx-auto py-12'} px-4`}>
      {!compact && (
        <div className="text-center mb-12">
          <h2 className="mb-4 text-3xl font-bold">Simple, Transparent Pricing</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Choose the plan that fits your needs. All plans include our core widget functionality.
          </p>
          
          <div className="mx-auto mt-6 max-w-2xl rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-md font-medium text-blue-700">
            7-day free trial - No credit card required
          </div>
          
          <div className="mt-6 inline-flex items-center rounded-lg bg-gray-100 p-1">
            <button 
              className={`rounded-md px-4 py-2 transition-all ${!isAnnual ? 'bg-white shadow-sm' : ''}`}
              onClick={() => setIsAnnual(false)}
            >
              Monthly
            </button>
            <button 
              className={`rounded-md px-4 py-2 transition-all ${isAnnual ? 'bg-white shadow-sm' : ''}`}
              onClick={() => setIsAnnual(true)}
            >
              Annual (20% off)
            </button>
          </div>
        </div>
      )}
      
      {compact && (
        <div className="flex justify-end mb-6">
          <div className="inline-flex items-center rounded-lg bg-gray-100 p-1">
            <button 
              className={`rounded-md text-sm px-3 py-1 transition-all ${!isAnnual ? 'bg-white shadow-sm' : ''}`}
              onClick={() => setIsAnnual(false)}
            >
              Monthly
            </button>
            <button 
              className={`rounded-md text-sm px-3 py-1 transition-all ${isAnnual ? 'bg-white shadow-sm' : ''}`}
              onClick={() => setIsAnnual(true)}
            >
              Annual
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 md:grid-cols-3">
        {/* Basic Plan */}
        {basicPlan && (
          <PricingCard
            {...basicPlan}
            selectedBillingCycle={selectedCycle}
            showBillingToggle={false}
            className="rounded-xl border border-gray-200 bg-white shadow-sm"
          />
        )}

        {/* Pro Plan */}
        {proPlan && (
          <PricingCard
            {...proPlan}
            selectedBillingCycle={selectedCycle}
            showBillingToggle={false}
            isRecommended={true}
            isPopular={true}
            className="rounded-xl border border-blue-200 bg-white shadow-md"
          />
        )}
        
        {/* Lifetime Plans Section */}
        <div className="flex flex-col">
          <div className="mb-4 text-center">
            <span className="rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 px-3 py-1 text-sm font-medium text-white">Lifetime Access</span>
          </div>
          
          {/* Basic Lifetime */}
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900">Basic Lifetime</h3>
            <div className="mt-2 flex items-baseline">
              <span className="text-3xl font-extrabold">${basicLifetimePlan?.price ?? 199}</span>
              <span className="ml-1 text-sm text-gray-500">one-time</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">Perfect for individuals and personal websites</p>
            <div className="mt-4">
              <a href="#" className="block w-full rounded-md bg-gray-900 px-4 py-2 text-center text-sm font-medium text-white">Buy Basic Lifetime</a>
            </div>
          </div>
          
          {/* Pro Lifetime */}
          <div className="rounded-xl border border-indigo-200 bg-gradient-to-b from-white to-indigo-50 p-4 shadow-md">
            <h3 className="text-xl font-bold text-gray-900">Pro Lifetime</h3>
            <div className="mt-2 flex items-baseline">
              <span className="text-3xl font-extrabold">${proLifetimePlan?.price ?? 399}</span>
              <span className="ml-1 text-sm text-gray-500">one-time</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">For entrepreneurs with multiple projects</p>
            <div className="mt-4">
              <a href="#" className="block w-full rounded-md bg-indigo-600 px-4 py-2 text-center text-sm font-medium text-white">Buy Pro Lifetime</a>
            </div>
          </div>
        </div>
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
