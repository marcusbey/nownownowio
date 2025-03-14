"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/data-display/card";
import { Button } from "@/components/core/button";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { useOrganization } from "@/query/org/org.query";
import { PLANS } from "@/features/billing/plans/plans";
import type { BillingCycle, PlanType } from "@/features/billing/plans/plans";
import { TRIAL_PERIOD_DAYS } from "@/features/billing/plans/plan-constants";
import { Badge } from "@/components/data-display/badge";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { addDays, format, differenceInDays } from "date-fns";
import { usePlanPricing, FALLBACK_PRICES } from "@/features/billing/plans/plan-pricing-context";
import { BuyButton } from "@/features/billing/payments/buy-button";

type SettingsPlanContentProps = {
  orgSlug: string;
};

export function SettingsPlanContent({ orgSlug }: SettingsPlanContentProps) {
  const { organization } = useOrganization(orgSlug);
  
  // Track the selected billing period separately from the current billing period
  const [selectedBillingPeriod, setSelectedBillingPeriod] = useState<BillingCycle | null>(null);
  
  // Initialize billing period based on the organization's plan
  const [billingPeriod, setBillingPeriod] = useState<BillingCycle>(() => {
    // Always use the organization's plan billing cycle if available
    return (organization?.plan?.billingCycle as BillingCycle) ?? "MONTHLY";
  });
  
  const [trialInfo, setTrialInfo] = useState<{ daysLeft: number; expiryDate: Date | null }>({ 
    daysLeft: 0, 
    expiryDate: null 
  });
  
  // Use the plan pricing context
  const { isLoading: isPricesLoading, getPriceAmount } = usePlanPricing();
  
  // The organization has a nested plan object with all the plan details
  // Extract the plan details directly from the organization.plan object using optional chaining
  const planId = organization?.plan?.id ?? 'FREE';
  const planType = organization?.plan?.type ?? 'BASIC';
  const planBillingCycle = organization?.plan?.billingCycle ?? 'MONTHLY';
  
  // Reset selected billing period when organization data changes
  useEffect(() => {
    if (organization?.plan) {
      setSelectedBillingPeriod(null);
    }
  }, [organization]);
  
  // Construct the current plan ID using the plan type and billing cycle
  // This ensures we always use the correct plan information
  const currentPlanId = planId.includes('_') ? planId : `${planType}_${planBillingCycle}`;
  
  // Determine the effective billing period to use (selected or current)
  const effectiveBillingPeriod = selectedBillingPeriod ?? billingPeriod;
  
  // Calculate the effective plan ID using the current plan type but with the effective billing period
  // This is used for debugging and UI display purposes
  const _effectivePlanId = organization?.plan ? `${organization.plan.type}_${effectiveBillingPeriod}` : '';
  
  // Find the current plan from the PLANS array
  const currentPlan = PLANS.find(p => p.id === currentPlanId);
  
  // Extract plan type and billing cycle from the planId - used in the UI
  // These variables are used in the getPlanDisplayName function
  const _planInfo = currentPlanId ? currentPlanId.split('_') : ['FREE', 'MONTHLY', 'LIFETIME'];
  
  // Update billing period whenever organization data changes
  useEffect(() => {
    // Set the billing period based on the plan billing cycle
    setBillingPeriod(planBillingCycle);
  }, [planBillingCycle]);
  
  // Calculate trial period information and determine if user is on trial
  // This is used in the button text and behavior logic
  const isOnTrial = trialInfo.daysLeft > 0;
  
  useEffect(() => {
    // Check if the organization has a plan and it's not a free plan
    if (organization?.plan?.createdAt && !planId.startsWith('FREE')) {
      // Check if the plan has been purchased (look for planChangedAt which is set when a payment is made)
      // Safely access planChangedAt with optional chaining
      const hasPurchasedPlan = !!organization.planChangedAt;
      
      // If the plan has been purchased, don't show trial info
      if (hasPurchasedPlan) {
        setTrialInfo({
          daysLeft: 0,
          expiryDate: null
        });
        
        return;
      }
      
      // Otherwise, calculate trial period as before
      const trialStartDate = new Date(organization.plan.createdAt);
      const trialEndDate = addDays(trialStartDate, TRIAL_PERIOD_DAYS);
      const daysLeft = differenceInDays(trialEndDate, new Date());
      
      setTrialInfo({
        daysLeft: Math.max(0, daysLeft),
        expiryDate: trialEndDate
      });
    }
  }, [organization, planId]);
  
  // Get a more descriptive plan name
  const getPlanDisplayName = (): string => {
    if (!currentPlanId) return "Free";
    
    const planType = currentPlanId.split('_')[0];
    const billingCycle = currentPlanId.split('_')[1] ?? '';
    
    // Updated to match database plan types
    let planName = planType === "FREE" ? "Free" : 
                  planType === "BASIC" ? "Basic" :
                  planType === "PRO" ? "Pro" :
                  planType === "PREMIUM" ? "Pro" : 
                  planType === "LIFETIME" ? "Lifetime" : 
                  planType === "FREEBIRD" ? "Free Bird" : 
                  organization?.plan?.type || "Free";
                  
    if (planType !== "FREE" && planType !== "FREEBIRD") {
      planName += billingCycle === "MONTHLY" ? " (Monthly)" : 
                 billingCycle === "YEARLY" || billingCycle === "ANNUAL" ? " (Annual)" : 
                 billingCycle === "LIFETIME" ? " (Lifetime)" : 
                 organization?.plan?.billingCycle === "LIFETIME" ? " (Lifetime)" : "";
    }
    
    return planName;
  };
  
  // Filter plans to show only relevant ones based on the effective billing period
  const filteredPlans = PLANS.filter(plan => 
    plan.billingCycle === effectiveBillingPeriod && 
    (plan.planType === "BASIC" || plan.planType === "PRO")
  );
  
  // Ensure we're showing the correct billing period tab based on the user's current plan
  useEffect(() => {
    if (currentPlanId) {
      const [, cycle] = currentPlanId.split('_');
      if (cycle && cycle !== billingPeriod) {
        setBillingPeriod(cycle as BillingCycle);
      }
    }
  }, [currentPlanId, billingPeriod]);
  
  // Force the billing period to match the current plan's billing cycle on initial load
  // This is a separate effect to ensure it runs only once at mount time
  useEffect(() => {
    if (currentPlanId) {
      const [, currentBillingCycle] = currentPlanId.split('_');
      if (currentBillingCycle) {
        // Force the billing period to match the current plan's billing cycle
        setBillingPeriod(currentBillingCycle as BillingCycle);
      }
    }
  }, [currentPlanId]);
  // Debug information is shown in the UI for development mode only
  return (
    <div className="py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Plan Settings</h2>
        <p className="text-sm text-muted-foreground">
          View your subscription plan
        </p>
      </div>

      {/* Current Subscription Section */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Current Plan: <span className="font-bold">{getPlanDisplayName()}</span></CardTitle>
            </div>
            <div className="flex gap-2">
              {currentPlanId && currentPlanId.startsWith('FREEBIRD') && (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Free Bird
                </Badge>
              )}
              
              {/* Show appropriate badge based on plan status */}
              {currentPlanId && !currentPlanId.startsWith('FREE') && (
                <>
                  {/* Trial active */}
                  {trialInfo.daysLeft > 0 && !organization?.planChangedAt && (
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      Trial Active
                    </Badge>
                  )}
                  
                  {/* Trial expired */}
                  {trialInfo.daysLeft === 0 && !organization?.planChangedAt && (
                    <Badge variant="outline" className="bg-amber-100 text-amber-800">
                      Trial Expired
                    </Badge>
                  )}
                  
                  {/* Paid plan */}
                  {organization?.planChangedAt && (
                    <Badge variant="outline" className="bg-primary/10 text-primary">
                      Paid Plan
                    </Badge>
                  )}
                </>
              )}
              
              {/* Free plan */}
              {currentPlanId && currentPlanId.startsWith('FREE') && (
                <Badge variant="outline" className="bg-slate-100 text-slate-800">
                  Free Plan
                </Badge>
              )}
            </div>
          </div>
          <CardDescription className="mt-1">
            {currentPlan?.description ?? "Your organization is currently on the free plan."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Plan status information box */}
          {currentPlanId && !currentPlanId.startsWith('FREE') && (
            <>
              {/* SCENARIO 1: Trial is active */}
              {trialInfo.daysLeft > 0 && !organization?.planChangedAt && (
                <div className="border rounded-md border-green-100 bg-green-50 p-3 text-xs">
                  <div className="flex items-center">
                    <div className="mr-2 rounded-full bg-green-100 p-1">
                      <Clock className="size-3 text-green-600" />
                    </div>
                    <p className="font-medium text-green-800">
                      Your 7-day free trial is active
                    </p>
                  </div>
                  <div className="mt-2 pl-6">
                    <p className="text-green-700">
                      {`${trialInfo.daysLeft} ${trialInfo.daysLeft === 1 ? 'day' : 'days'} remaining - expires on ${trialInfo.expiryDate ? format(trialInfo.expiryDate, 'MMMM d, yyyy') : ''}`}
                    </p>
                    <p className="mt-1 text-green-600">
                      You have full access to all premium features during your trial. No credit card required.
                    </p>
                    {trialInfo.daysLeft <= 2 && (
                      <div className="mt-3">
                        <BuyButton
                          planType={planType as PlanType}
                          billingCycle={planBillingCycle as BillingCycle}
                          orgSlug={orgSlug}
                          size="sm"
                          variant="default"
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          Upgrade Now
                        </BuyButton>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* SCENARIO 2: Trial has expired */}
              {trialInfo.daysLeft === 0 && !organization?.planChangedAt && (
                <div className="border rounded-md border-amber-100 bg-amber-50 p-3 text-xs">
                  <div className="flex items-center">
                    <div className="mr-2 rounded-full bg-amber-100 p-1">
                      <XCircle className="size-3 text-amber-600" />
                    </div>
                    <p className="font-medium text-amber-800">
                      Your trial period has ended
                    </p>
                  </div>
                  <div className="mt-2 pl-6">
                    <p className="text-amber-700">
                      Your access to premium features has been limited. Upgrade now to restore full functionality.
                    </p>
                    <div className="mt-3">
                      <BuyButton
                        planType={planType as PlanType}
                        billingCycle={planBillingCycle as BillingCycle}
                        orgSlug={orgSlug}
                        size="sm"
                        variant="default"
                        className="w-full bg-amber-600 hover:bg-amber-700"
                      >
                        Upgrade Now
                      </BuyButton>
                    </div>
                  </div>
                </div>
              )}
              
              {/* SCENARIO 3: Paid plan is active */}
              {organization?.planChangedAt && (
                <div className="border rounded-md border-primary/10 bg-primary/5 p-3 text-xs">
                  <div className="flex items-center">
                    <div className="mr-2 rounded-full bg-primary/10 p-1">
                      <CheckCircle2 className="size-3 text-primary" />
                    </div>
                    <p className="font-medium text-primary">
                      Your plan is active
                    </p>
                  </div>
                  <div className="mt-2 pl-6">
                    <p className="text-muted-foreground">
                      {`Activated on ${organization.planChangedAt ? format(new Date(organization.planChangedAt), 'MMMM d, yyyy') : ''}`}
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      You have full access to all premium features included in your plan.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* Free plan info */}
          {currentPlanId && currentPlanId.startsWith('FREE') && (
            <div className="border rounded-md border-slate-100 bg-slate-50 p-3 text-xs">
              <div className="flex items-center">
                <div className="mr-2 rounded-full bg-slate-100 p-1">
                  <CheckCircle2 className="size-3 text-slate-600" />
                </div>
                <p className="font-medium text-slate-800">
                  Free Plan
                </p>
              </div>
              <div className="mt-2 pl-6">
                <p className="text-slate-600">
                  You're currently on the free plan with limited features.
                </p>
                <div className="mt-3">
                  <BuyButton
                    planType="BASIC"
                    billingCycle={effectiveBillingPeriod as BillingCycle}
                    orgSlug={orgSlug}
                    size="sm"
                    variant="outline"
                    className="w-full"
                  >
                    Explore Premium Plans
                  </BuyButton>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Plans - Enhanced for Settings Page */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available Plans</CardTitle>
          <CardDescription>
            Compare and upgrade to a different plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Billing Period Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Billing Period</label>
              <div className="mx-auto flex max-w-xs overflow-hidden rounded-lg border bg-background/80 shadow-sm">
                <div
                  className={cn(
                    "flex-1 cursor-pointer px-4 py-2.5 text-center transition-all",
                    effectiveBillingPeriod === "MONTHLY" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  )}
                  onClick={() => {
                    // Set the selected billing period
                    setSelectedBillingPeriod("MONTHLY");
                  }}
                >
                  <div className="font-medium">Monthly</div>
                </div>
                <div
                  className={cn(
                    "flex-1 cursor-pointer px-4 py-2.5 text-center transition-all",
                    effectiveBillingPeriod === "ANNUAL" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  )}
                  onClick={() => {
                    // Set the selected billing period
                    setSelectedBillingPeriod("ANNUAL");
                  }}
                >
                  <div className="font-medium">Yearly</div>
                </div>
                <div
                  className={cn(
                    "flex-1 cursor-pointer px-4 py-2.5 text-center transition-all",
                    effectiveBillingPeriod === "LIFETIME" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  )}
                  onClick={() => {
                    // Set the selected billing period
                    setSelectedBillingPeriod("LIFETIME");
                  }}
                >
                  <div className="font-medium">Lifetime</div>
                </div>
              </div>
              <div className="mt-2 text-center text-xs text-muted-foreground">
                {effectiveBillingPeriod === "MONTHLY" && "Pay month-to-month"}
                {effectiveBillingPeriod === "ANNUAL" && "Save 20% annually"}
                {effectiveBillingPeriod === "LIFETIME" && "One-time payment"}
              </div>
              
              {/* Show which billing period is being viewed */}
              {selectedBillingPeriod && (
                <div className="mt-1 text-center text-xs text-primary">
                  Viewing plans with {selectedBillingPeriod.toLowerCase()} billing
                </div>
              )}
              {/* Debug info - can be removed after testing */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-1 space-y-1 text-center text-xs text-muted-foreground/50">
                  <div>Current plan: {currentPlanId} | Current billing period: {billingPeriod}</div>
                  <div>Selected billing period: {selectedBillingPeriod ?? 'none'}</div>
                  <div>Effective billing period: {effectiveBillingPeriod}</div>
                  <div>Organization plan ID: {organization?.plan?.id ?? 'undefined'}</div>
                  <div>Organization plan type: {organization?.plan?.type ?? 'undefined'}</div>
                  <div>Organization plan billing cycle: {organization?.plan?.billingCycle ?? 'undefined'}</div>
                </div>
              )}
            </div>

            {/* Enhanced Plan Cards */}
            <div className="grid gap-6 md:grid-cols-2">
              {filteredPlans.map((plan) => {
                // Extract plan type and billing cycle from plan ID
                const [planType, planCycle] = plan.id.split('_');
                
                // Check if this is the current active plan
                const isCurrentPlan = organization?.plan?.id === plan.id || 
                  (organization?.plan && organization.plan.type === planType && organization.plan.billingCycle === planCycle);
                
                // Check if this is the effective plan (same type as current plan but with selected billing period)
                const isEffectivePlan = organization?.plan && organization.plan.type === planType && plan.billingCycle === effectiveBillingPeriod;
                const isBasicPlan = plan.planType === "BASIC";
                const isProPlan = plan.planType === "PRO";
                
                // Calculate price based on plan and effective billing period
                // This ensures prices update when tabs are clicked
                const price = isPricesLoading ?
                  // Use fallback prices during loading
                  (plan.billingCycle === "LIFETIME" ? 
                    (isBasicPlan ? FALLBACK_PRICES.BASIC.LIFETIME : FALLBACK_PRICES.PRO.LIFETIME) : 
                    plan.billingCycle === "ANNUAL" ? 
                      (isBasicPlan ? FALLBACK_PRICES.BASIC.ANNUAL : FALLBACK_PRICES.PRO.ANNUAL) : 
                      (isBasicPlan ? FALLBACK_PRICES.BASIC.MONTHLY : FALLBACK_PRICES.PRO.MONTHLY)) :
                  // Use prices from API
                  getPriceAmount(isBasicPlan ? "BASIC" : "PRO", plan.billingCycle) || 
                  // Fallback if price not found
                  (plan.billingCycle === "LIFETIME" ? 
                    (isBasicPlan ? FALLBACK_PRICES.BASIC.LIFETIME : FALLBACK_PRICES.PRO.LIFETIME) : 
                    plan.billingCycle === "ANNUAL" ? 
                      (isBasicPlan ? FALLBACK_PRICES.BASIC.ANNUAL : FALLBACK_PRICES.PRO.ANNUAL) : 
                      (isBasicPlan ? FALLBACK_PRICES.BASIC.MONTHLY : FALLBACK_PRICES.PRO.MONTHLY));
                
                // Get price suffix based on the plan's billing period
                // This ensures suffixes update when tabs are clicked
                const priceSuffix = plan.billingCycle === "LIFETIME" ? 
                  " one-time" : plan.billingCycle === "ANNUAL" ? 
                  "/year" : "/month";
                
                return (
                  <div
                    key={plan.id}
                    className={cn(
                      "relative flex flex-col rounded-xl border p-6 transition-all hover:shadow-md",
                      isCurrentPlan && "border-[3px] border-primary bg-primary/10 shadow-md",
                      !isCurrentPlan && "border-muted"
                    )}
                  >
                    {/* Plan Header */}
                    <div className="mb-4">
                      {/* Plan Badges */}
                      <div className="mb-2 flex items-center gap-2">
                        {isProPlan && (
                          <div className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                            Popular
                          </div>
                        )}
                        {/* Show badge for the effective plan when billing period is changed */}
                        {selectedBillingPeriod && isEffectivePlan && !isCurrentPlan && (
                          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                            Selected Billing
                          </Badge>
                        )}
                        {isCurrentPlan && (
                          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                            Current Plan
                          </Badge>
                        )}
                      </div>
                      
                      {/* Plan Name and Price */}
                      <h3 className="text-xl font-semibold">{plan.name}</h3>
                      <div className="mt-2">
                        <span className="text-3xl font-bold">${typeof price === 'object' && 'amount' in price ? price.amount : (price || 0)}</span>
                        <span className="ml-1 text-muted-foreground">{priceSuffix}</span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {isBasicPlan ? 
                          "Perfect for individuals and small teams" : 
                          "Ideal for growing teams and businesses"}
                      </p>
                    </div>
                    
                    {/* Plan Features */}
                    <div className="mb-6 space-y-3">
                      <h4 className="text-sm font-medium text-muted-foreground">What's included:</h4>
                      <ul className="space-y-2.5">
                        {plan.features.map((feature, i) => {
                          const isDisabled = feature.includes("Powered by") && feature.includes("branding");
                          return (
                            <li key={i} className="flex items-start">
                              {!isDisabled ? (
                                <CheckCircle2 className="mr-2 mt-0.5 size-4 shrink-0 text-green-500" />
                              ) : (
                                <XCircle className="mr-2 mt-0.5 size-4 shrink-0 text-muted-foreground" />
                              )}
                              <span className={cn("text-sm", isDisabled && "text-muted-foreground")}>
                                {feature}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                    
                    {/* Action Button */}
                    <div className="mt-auto">
                      {/* Determine button text based on plan comparison */}
                      {(() => {
                        // If it's the current plan, just show "Current Plan"
                        if (isCurrentPlan) {
                          // For current plan, show different button based on trial status
                          const isInTrial = trialInfo.daysLeft > 0;
                          
                          if (isInTrial) {
                            return (
                              <BuyButton
                                planType={planType as PlanType}
                                billingCycle={planBillingCycle as BillingCycle}
                                orgSlug={orgSlug}
                                variant="default"
                                className="w-full"
                              >
                                Activate Plan
                              </BuyButton>
                            );
                          } else {
                            return (
                              <Button 
                                variant="outline"
                                className="w-full border-2 border-primary/50 font-medium text-primary hover:bg-primary/10"
                                disabled
                              >
                                Current Plan
                              </Button>
                            );
                          }
                        }
                        
                        // Extract plan type and billing cycle from current and target plans
                        const [currentType, currentCycle] = currentPlanId.split('_');
                        const [targetType, targetCycle] = plan.id.split('_');
                        
                        // Determine if this is an upgrade, downgrade, or just a billing change
                        const isUpgrade = 
                          currentType === 'FREE' || currentType === 'FREEBIRD' || 
                          (currentType === 'BASIC' && targetType === 'PRO');
                          
                        const isDowngrade = 
                          (currentType === 'PRO' && targetType === 'BASIC') || 
                          (targetType === 'FREE' || targetType === 'FREEBIRD');
                          
                        const isBillingChange = 
                          currentType === targetType && currentCycle !== targetCycle;
                        
                        // Set button text and variant based on change type and trial status
                        let buttonText = "Change Plan";
                        let buttonVariant: "default" | "secondary" | "outline" = "default";
                        
                        // Use the isOnTrial variable from the component scope
                        // This ensures we're consistent with the trial status throughout the component
                        
                        // Use the isEffectivePlan variable to determine if this plan should show as selected
                        // when a different billing period is chosen
                        
                        if (isEffectivePlan && selectedBillingPeriod) {
                          buttonText = "Selected Billing";
                          buttonVariant = "default";
                        } else if (isUpgrade) {
                          buttonText = isOnTrial ? "Activate This Plan" : "Upgrade to this Plan";
                          buttonVariant = "default";
                        } else if (isDowngrade) {
                          buttonText = "Downgrade to this Plan";
                          buttonVariant = "secondary"; // Using neutral secondary instead of destructive
                        } else if (isBillingChange) {
                          buttonText = `Switch to ${targetCycle.toLowerCase()} billing`;
                          buttonVariant = "outline";
                        }
                        

                        
                        return (
                          <BuyButton
                            planType={targetType as PlanType}
                            billingCycle={targetCycle as BillingCycle}
                            orgSlug={orgSlug}
                            variant={buttonVariant}
                            className="w-full"
                          >
                            {buttonText}
                          </BuyButton>
                        );
                      })()}
                      
                    </div>
                    
                    {/* Current Plan Indicator */}
                    {isCurrentPlan && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-white shadow-sm">
                        Your Plan
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Reset Selection Button - only shown when a billing period is selected */}
            {selectedBillingPeriod && (
              <div className="mb-4 flex justify-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedBillingPeriod(null)}
                  className="text-sm"
                >
                  Reset to Current Billing
                </Button>
              </div>
            )}
            
            {/* Additional Information */}
            <div className="rounded-lg bg-muted/30 p-4 text-sm">
              <h4 className="mb-2 font-medium">Need help choosing a plan?</h4>
              <p className="text-muted-foreground">
                All plans include a 7-day free trial with full access to all features. 
                You can upgrade, downgrade, or cancel at any time. 
                Contact our support team if you have any questions about which plan is right for you.
              </p>
            </div>
            
            {/* Global Call to Action Button */}
            {trialInfo && typeof trialInfo.daysLeft === 'number' && trialInfo.daysLeft > 0 && (
              <div className="mt-6 flex flex-col items-center justify-center space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-6 text-center">
                <h3 className="text-xl font-semibold">Ready to activate your plan?</h3>
                <p className="text-muted-foreground">
                  Your 7-day free trial gives you full access to all features. Activate now to continue using {getPlanDisplayName()} after your trial ends.
                </p>
                <BuyButton
                  planType={planType as PlanType}
                  billingCycle={planBillingCycle as BillingCycle}
                  orgSlug={orgSlug}
                  size="lg"
                  className="mt-2 px-8"
                >
                  Activate Plan
                </BuyButton>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
