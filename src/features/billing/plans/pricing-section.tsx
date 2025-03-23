"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { PLANS, PLAN_TYPES } from "./plans";
import type { BillingCycle, PlanType } from "./plans";
import { useRouter } from "next/navigation";
import { savePlanSelection } from "./plan-actions";
import { usePlanPricing } from "./plan-pricing-context";

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
  const { getPriceAmount, isLoading } = usePlanPricing();

  // Get the selected plan based on the selected billing cycle and plan type
  const selectedCycle: BillingCycle = isAnnual ? "ANNUAL" : "MONTHLY";
  const selectedPlan = PLANS.find(plan => plan.planType === selectedPlanType && plan.billingCycle === selectedCycle);
  
  // Get lifetime plan for the selected plan type
  const lifetimePlan = PLANS.find(plan => 
    plan.planType === selectedPlanType && 
    plan.billingCycle === "LIFETIME"
  );
  
  // Get dynamic prices from Stripe via context
  const selectedPlanPrice = getPriceAmount(selectedPlanType, selectedCycle);
  const lifetimePlanPrice = getPriceAmount(selectedPlanType, "LIFETIME");
  
  // We don't need to calculate yearlyPrice separately anymore as we use selectedPlanPrice directly
  
  // For annual plans, we need both the annual price and the monthly equivalent
  const monthlyPrice = selectedCycle === "MONTHLY" ? selectedPlanPrice : selectedPlanPrice / 12;
  const monthlyEquivalent = selectedCycle === "ANNUAL" ? monthlyPrice : undefined;
  
  // Format prices with commas for thousands separators
  const formatPrice = (price: number): string => {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };
  
  // Format with decimal places for monthly equivalent
  const formatDecimalPrice = (price: number): string => {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };
  
  // Handle plan selection and redirect to signup
  const handlePlanSelection = async (planId: string) => {
    try {
      // Save the selected plan to the database
      await savePlanSelection(planId);
      
      // Redirect to signup page
      router.push("/auth/signup");
    } catch (error) {
      // Log error but don't expose to console in production
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error("Failed to save plan selection:", error);
      }
    }
  };

  return (
    <div className="container relative z-10">


    <div className={`w-full ${compact ? 'max-w-full' : 'mx-auto py-12'} px-4`}>
      {!compact && (
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">Simple, Transparent Pricing</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-500 dark:text-gray-400">
            Choose the perfect plan for your needs
          </p>
          
          <div className="mx-auto mt-6 max-w-2xl rounded-md border border-blue-200 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 px-6 py-4 text-xl font-bold text-blue-800 shadow-sm dark:border-blue-800 dark:from-blue-900/20 dark:to-indigo-900/20 dark:text-blue-100">
            ✨ 7-day free trial - No credit card required ✨
          </div>
          
          {/* Combined Plan Type and Billing Cycle Toggle */}
          <div className="mt-8 inline-flex flex-col justify-center gap-4 sm:flex-row">
            {/* Plan Type Toggle */}
            <div className="inline-flex items-center rounded-lg bg-gray-100 p-1 shadow-sm dark:bg-gray-800">
              <button 
                className={`rounded-md px-4 py-2 transition-all ${selectedPlanType === PLAN_TYPES.BASIC ? 'bg-white dark:bg-gray-700 shadow-sm font-medium' : 'dark:text-gray-300'}`}
                onClick={() => setSelectedPlanType(PLAN_TYPES.BASIC)}
              >
                Basic
              </button>
              <button 
                className={`rounded-md px-4 py-2 transition-all ${selectedPlanType === PLAN_TYPES.PRO ? 'bg-white dark:bg-gray-700 shadow-sm font-medium' : 'bg-blue-500/5 text-blue-700 hover:text-blue-900 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:text-blue-100'}`}
                onClick={() => setSelectedPlanType(PLAN_TYPES.PRO)}
              >
                Pro
              </button>
            </div>
            
            {/* Billing Cycle Toggle */}
            <div className="inline-flex items-center rounded-lg bg-gray-100 p-1 shadow-sm dark:bg-gray-800">
              <button 
                className={`rounded-md px-4 py-2 transition-all ${!isAnnual ? 'bg-white dark:bg-gray-700 shadow-sm font-medium' : 'dark:text-gray-300'}`}
                onClick={() => setIsAnnual(false)}
              >
                Monthly
              </button>
              <button 
                className={`rounded-md px-4 py-2 transition-all ${isAnnual ? 'bg-white dark:bg-gray-700 shadow-sm font-medium' : 'bg-green-500/5 text-green-700 hover:text-green-900 dark:bg-green-500/10 dark:text-green-300 dark:hover:text-green-100'}`}
                onClick={() => setIsAnnual(true)}
              >
                Annual (20% off)
              </button>
            </div>
          </div>
        </div>
      )}
      
      {compact && (
        <div className="mb-6 flex justify-end">
          <div className="inline-flex items-center rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
            <button 
              className={`rounded-md px-3 py-1 text-sm transition-all ${!isAnnual ? 'bg-white dark:bg-gray-700 shadow-sm' : 'dark:text-gray-300'}`}
              onClick={() => setIsAnnual(false)}
            >
              Monthly
            </button>
            <button 
              className={`rounded-md px-3 py-1 text-sm transition-all ${isAnnual ? 'bg-white dark:bg-gray-700 shadow-sm' : 'dark:text-gray-300'}`}
              onClick={() => setIsAnnual(true)}
            >
              Annual
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
        {/* Monthly/Annual Plan */}
        {selectedPlan && (
          <div className={`relative rounded-xl border ${selectedPlanType === PLAN_TYPES.PRO ? 'border-blue-200 bg-blue-500/5 dark:border-blue-800 dark:bg-blue-500/10' : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'} p-6 shadow-md transition-shadow duration-300 hover:shadow-lg`}>
            {selectedPlanType === PLAN_TYPES.PRO && (
              <div className="absolute -top-3 left-6 rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white shadow-sm">
                Most Popular
              </div>
            )}
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedPlan.name}</h3>
            <p className="mt-2 text-base text-gray-700 dark:text-gray-200">{selectedPlan.description}</p>
            
            <div className="mt-6 flex items-baseline">
              <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                ${isLoading ? "..." : formatPrice(monthlyPrice)}
              </span>
              <span className="ml-1 text-xl font-medium text-gray-600 dark:text-gray-300">/mo</span>
              {selectedCycle === "ANNUAL" && (
                <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                  (${formatDecimalPrice(monthlyEquivalent)})
                </span>
              )}
            </div>
            
            {selectedCycle === "ANNUAL" && (
              <p className="mt-1 text-base font-medium text-green-600 dark:text-green-400">
                ${formatPrice(selectedPlanPrice)} billed annually
              </p>
            )}
            
            <ul className="mt-6 space-y-3">
              {selectedPlan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="size-5 shrink-0 text-green-500" />
                  <span className="ml-3 text-base font-medium text-gray-800 dark:text-gray-100">{feature}</span>
                </li>
              ))}
            </ul>
            
            <div className="mt-8">
              <button 
                onClick={async () => handlePlanSelection(selectedPlan.id)}
                className="block w-full rounded-md bg-blue-600 px-4 py-3 text-center text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
              >
                Join Community
              </button>
            </div>
          </div>
        )}
        
        {/* Lifetime Plan */}
        {lifetimePlan && (
          <div className="relative rounded-xl border border-indigo-200 bg-indigo-500/5 p-6 shadow-md transition-shadow duration-300 hover:shadow-lg dark:border-indigo-800 dark:bg-indigo-500/10">
            <div className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 px-3 py-1 text-xs font-medium text-white shadow-sm">
              Lifetime Access
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{lifetimePlan.name}</h3>
            <p className="mt-2 text-base text-gray-700 dark:text-gray-200">{lifetimePlan.description}</p>
            
            <div className="mt-6 flex items-baseline">
              <span className="text-4xl font-extrabold text-gray-900 dark:text-white">${isLoading ? "..." : formatPrice(lifetimePlanPrice)}</span>
              <span className="ml-1 text-xl font-medium text-gray-600 dark:text-gray-300">one-time</span>
            </div>
            
            <ul className="mt-6 space-y-3">
              {lifetimePlan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="size-5 shrink-0 text-green-500" />
                  <span className="ml-3 text-base font-medium text-gray-800 dark:text-gray-100">{feature}</span>
                </li>
              ))}
            </ul>
            
            <div className="mt-8">
              <button 
                onClick={async () => handlePlanSelection(lifetimePlan.id)}
                className="block w-full rounded-md bg-indigo-600 px-4 py-3 text-center text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
              >
                Join Community
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-16 text-center">
        <h3 className="mb-4 text-xl font-semibold dark:text-white">All Plans Include</h3>
        <div className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-4">
          <div className="flex items-center gap-2">
            <Check className="size-5 text-green-500" />
            <span className="dark:text-gray-300">Easy widget embedding</span>
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
  // Using eslint-disable to handle unused parameters
  defaultBillingCycle = "MONTHLY", // eslint-disable-line @typescript-eslint/no-unused-vars
  showFreeOnly = false, // eslint-disable-line @typescript-eslint/no-unused-vars
  showPaidOnly = false, // eslint-disable-line @typescript-eslint/no-unused-vars
  title = "Pricing", // eslint-disable-line @typescript-eslint/no-unused-vars
  subtitle = "Choose the best plan for your needs", // eslint-disable-line @typescript-eslint/no-unused-vars
  className, // eslint-disable-line @typescript-eslint/no-unused-vars
}: PricingSectionProps) => {
  return <PricingCards />;
};

// For backward compatibility
export const ClientPricingSection = ({ variant }: { variant?: string }) => {
  return <PricingCards compact={variant === "compact"} />;
};
