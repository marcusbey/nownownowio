"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { PLANS, PLAN_TYPES } from "./plans";
import type { BillingCycle, PlanType } from "./plans";
import { PricingCard } from "./pricing-card";
import { useRouter } from "next/navigation";
import { savePlanSelection } from "./plan-actions";

type PricingSectionProps = {
  defaultBillingCycle?: BillingCycle;
  defaultPlanType?: PlanType;
  showFreeOnly?: boolean;
  showPaidOnly?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
  compact?: boolean;
}

export const PricingCards = ({ compact = false }: { compact?: boolean }) => {
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedPlanType, setSelectedPlanType] = useState<PlanType>(PLAN_TYPES.BASIC);

  // Get the selected plan based on the selected billing cycle and plan type
  const selectedCycle: BillingCycle = isAnnual ? "ANNUAL" : "MONTHLY";
  const selectedPlan = PLANS.find(plan => plan.planType === selectedPlanType && plan.billingCycle === selectedCycle);
  
  // Get lifetime plan for the selected plan type
  const lifetimePlan = PLANS.find(plan => 
    plan.planType === selectedPlanType && 
    plan.billingCycle === "LIFETIME"
  );
  
  // Handle plan selection and redirect to signup
  const handlePlanSelection = async (planId: string) => {
    try {
      // Save the selected plan to the database
      await savePlanSelection(planId);
      
      // Redirect to signup page
      router.push("/auth/signup");
    } catch (error) {
      console.error("Failed to save plan selection:", error);
    }
  };

  return (
    <div className="container relative z-10">


    <div className={`w-full ${compact ? 'max-w-full' : 'mx-auto py-12'} px-4`}>
      {!compact && (
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">Simple, Transparent Pricing</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Choose the perfect plan for your needs
          </p>
          
          <div className="text-md mx-auto mt-6 max-w-2xl rounded-md border border-blue-100 bg-blue-50 px-4 py-3 font-medium text-blue-700">
            7-day free trial - No credit card required
          </div>
          
          {/* Plan Type Toggle */}
          <div className="mb-4 mt-6 inline-flex items-center rounded-lg bg-gray-100 p-1">
            <button 
              className={`rounded-md px-4 py-2 transition-all ${selectedPlanType === PLAN_TYPES.BASIC ? 'bg-white shadow-sm' : ''}`}
              onClick={() => setSelectedPlanType(PLAN_TYPES.BASIC)}
            >
              Basic
            </button>
            <button 
              className={`rounded-md px-4 py-2 transition-all ${selectedPlanType === PLAN_TYPES.PRO ? 'bg-white shadow-sm' : ''}`}
              onClick={() => setSelectedPlanType(PLAN_TYPES.PRO)}
            >
              Pro
            </button>
          </div>
          
          {/* Billing Cycle Toggle */}
          <div className="mt-2 inline-flex items-center rounded-lg bg-gray-100 p-1">
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
        <div className="mb-6 flex justify-end">
          <div className="inline-flex items-center rounded-lg bg-gray-100 p-1">
            <button 
              className={`rounded-md px-3 py-1 text-sm transition-all ${!isAnnual ? 'bg-white shadow-sm' : ''}`}
              onClick={() => setIsAnnual(false)}
            >
              Monthly
            </button>
            <button 
              className={`rounded-md px-3 py-1 text-sm transition-all ${isAnnual ? 'bg-white shadow-sm' : ''}`}
              onClick={() => setIsAnnual(true)}
            >
              Annual
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 md:grid-cols-2">
        {/* Monthly/Annual Plan */}
        {selectedPlan && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900">{selectedPlan.name}</h3>
            <p className="mt-2 text-sm text-gray-500">{selectedPlan.description}</p>
            
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-extrabold">${selectedPlan.price}</span>
              <span className="ml-1 text-xl text-gray-500">{selectedCycle === "MONTHLY" ? "/month" : "/mo"}</span>
            </div>
            
            {selectedCycle === "ANNUAL" && selectedPlan.yearlyPrice && (
              <p className="mt-1 text-sm text-green-600">
                ${selectedPlan.yearlyPrice} billed annually
              </p>
            )}
            
            <ul className="mt-6 space-y-3">
              {selectedPlan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="size-5 shrink-0 text-green-500" />
                  <span className="ml-3 text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            
            <div className="mt-8">
              <button 
                onClick={async () => handlePlanSelection(selectedPlan.id)}
                className="block w-full rounded-md bg-blue-600 px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Join Community
              </button>
            </div>
          </div>
        )}
        
        {/* Lifetime Plan */}
        {lifetimePlan && (
          <div className="rounded-xl border border-indigo-200 bg-gradient-to-b from-white to-indigo-50 p-6 shadow-md">
            <div className="mb-4">
              <span className="rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 px-3 py-1 text-sm font-medium text-white">Lifetime Access</span>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900">{lifetimePlan.name}</h3>
            <p className="mt-2 text-sm text-gray-500">{lifetimePlan.description}</p>
            
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-extrabold">${lifetimePlan.price}</span>
              <span className="ml-1 text-sm text-gray-500">one-time</span>
            </div>
            
            <ul className="mt-6 space-y-3">
              {lifetimePlan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="size-5 shrink-0 text-green-500" />
                  <span className="ml-3 text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            
            <div className="mt-8">
              <button 
                onClick={async () => handlePlanSelection(lifetimePlan.id)}
                className="block w-full rounded-md bg-indigo-600 px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-indigo-700"
              >
                Join Community
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-16 text-center">
        <h3 className="mb-4 text-xl font-semibold">All Plans Include</h3>
        <div className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-4">
          <div className="flex items-center gap-2">
            <Check className="size-5 text-green-500" />
            <span>Easy widget embedding</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="size-5 text-green-500" />
            <span>Status updates</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="size-5 text-green-500" />
            <span>Community support</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="size-5 text-green-500" />
            <span>Responsive widgets</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="size-5 text-green-500" />
            <span>SSL security</span>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-600">Not sure which plan to choose?</p>
        <button className="mt-2 font-medium text-blue-600 hover:underline">Contact us for help</button>
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
