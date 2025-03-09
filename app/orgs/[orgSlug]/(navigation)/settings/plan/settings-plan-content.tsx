"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/data-display/card";
import { Button } from "@/components/core/button";
import { CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { useOrganization } from "@/query/org/org.query";
import { PLANS } from "@/features/billing/plans/plans";
import type { BillingCycle } from "@/features/billing/plans/plans";
import { Badge } from "@/components/data-display/badge";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { addDays, format, differenceInDays } from "date-fns";

type SettingsPlanContentProps = {
  orgSlug: string;
};

export function SettingsPlanContent({ orgSlug }: SettingsPlanContentProps) {
  const { organization } = useOrganization(orgSlug);
  const [billingPeriod, setBillingPeriod] = useState<BillingCycle>("MONTHLY");
  const [trialInfo, setTrialInfo] = useState<{ daysLeft: number; expiryDate: Date | null }>({ 
    daysLeft: 0, 
    expiryDate: null 
  });
  
  // Find the current plan - assuming PRO_MONTHLY if not found
  const currentPlanId = organization?.plan?.id || "PRO_MONTHLY";
  const currentPlan = PLANS.find(p => p.id === currentPlanId);
  
  // Extract plan type and billing cycle from the planId - used in the UI
  // These variables are used in the getPlanDisplayName function
  const _planInfo = currentPlanId?.split('_') || ['FREE', 'MONTHLY'];
  
  // Set initial billing period based on the current plan
  useEffect(() => {
    if (currentPlanId) {
      const planParts = currentPlanId.split('_');
      if (planParts.length > 1) {
        setBillingPeriod(planParts[1] as BillingCycle);
      }
    }
  }, [currentPlanId]);
  
  // Calculate trial period information
  useEffect(() => {
    if (organization?.createdAt && !currentPlanId?.startsWith('FREE')) {
      // Use organization creation date as trial start date if planChangedAt is not available
      const trialStartDate = organization.planChangedAt 
        ? new Date(organization.planChangedAt)
        : new Date(organization.createdAt);
      const trialEndDate = addDays(trialStartDate, 7); // 7-day trial
      const daysLeft = differenceInDays(trialEndDate, new Date());
      
      setTrialInfo({
        daysLeft: Math.max(0, daysLeft),
        expiryDate: trialEndDate
      });
    }
  }, [organization, currentPlanId]);
  
  // Get a more descriptive plan name
  const getPlanDisplayName = (): string => {
    if (!currentPlanId) return "Free";
    
    const planType = currentPlanId.split('_')[0];
    const billingCycle = currentPlanId.split('_')[1] || '';
    
    // Updated to match database plan types
    let planName = planType === "FREE" ? "Free" : 
                  planType === "PREMIUM" ? "Pro" : 
                  planType === "LIFETIME" ? "Lifetime" : 
                  planType === "FREEBIRD" ? "Free Bird" : "Unknown";
                  
    if (planType !== "FREE" && planType !== "FREEBIRD") {
      planName += billingCycle === "MONTHLY" ? " (Monthly)" : 
                 billingCycle === "YEARLY" ? " (Yearly)" : 
                 billingCycle === "LIFETIME" ? " (Lifetime)" : "";
    }
    
    return planName;
  };
  
  // Filter plans to show only relevant ones based on the selected billing period
  const filteredPlans = PLANS.filter(plan => 
    plan.billingCycle === billingPeriod && 
    (plan.planType === "BASIC" || plan.planType === "PRO")
  );

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
              {currentPlanId?.startsWith('FREEBIRD') && (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Free Bird
                </Badge>
              )}
              {/* Show trial badge if plan is not FREE */}
              {currentPlanId && !currentPlanId.startsWith('FREE') && (
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  7-day Trial
                </Badge>
              )}
              {currentPlan && (
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  Active Plan
                </Badge>
              )}
            </div>
          </div>
          <CardDescription className="mt-1">
            {currentPlan?.description ?? "Your organization is currently on the free plan."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Show trial info if on a paid plan */}
          {currentPlanId && !currentPlanId.startsWith('FREE') && (
            <div className="rounded-md bg-primary/5 p-3 text-sm">
              <p className="font-medium">
                {trialInfo.daysLeft > 0 
                  ? `Your 7-day free trial is active - ${trialInfo.daysLeft} ${trialInfo.daysLeft === 1 ? 'day' : 'days'} remaining` 
                  : 'Your trial period has ended'}
              </p>
              <p className="mt-1 text-muted-foreground">
                {trialInfo.daysLeft > 0 
                  ? `You'll have full access to all features until ${trialInfo.expiryDate ? format(trialInfo.expiryDate, 'MMMM d, yyyy') : ''}. No credit card required.`
                  : 'Please upgrade your plan to continue using premium features.'}
              </p>
              {trialInfo.daysLeft <= 2 && trialInfo.daysLeft > 0 && (
                <div className="mt-2">
                  <Link href={`/orgs/${orgSlug}/settings/subscription`}>
                    <Button size="sm" variant="default">
                      Upgrade Now
                    </Button>
                  </Link>
                </div>
              )}
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
                    billingPeriod === "MONTHLY" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  )}
                  onClick={() => setBillingPeriod("MONTHLY")}
                >
                  <div className="font-medium">Monthly</div>
                </div>
                <div
                  className={cn(
                    "flex-1 cursor-pointer px-4 py-2.5 text-center transition-all",
                    billingPeriod === "ANNUAL" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  )}
                  onClick={() => setBillingPeriod("ANNUAL")}
                >
                  <div className="font-medium">Yearly</div>
                </div>
                <div
                  className={cn(
                    "flex-1 cursor-pointer px-4 py-2.5 text-center transition-all",
                    billingPeriod === "LIFETIME" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  )}
                  onClick={() => setBillingPeriod("LIFETIME")}
                >
                  <div className="font-medium">Lifetime</div>
                </div>
              </div>
              <div className="mt-2 text-center text-xs text-muted-foreground">
                {billingPeriod === "MONTHLY" && "Pay month-to-month"}
                {billingPeriod === "ANNUAL" && "Save 20% annually"}
                {billingPeriod === "LIFETIME" && "One-time payment"}
              </div>
            </div>

            {/* Enhanced Plan Cards */}
            <div className="grid gap-6 md:grid-cols-2">
              {filteredPlans.map((plan) => {
                const isCurrentPlan = currentPlanId === plan.id;
                const isBasicPlan = plan.planType === "BASIC";
                const isProPlan = plan.planType === "PRO";
                
                // Calculate price based on plan and billing period
                const price = billingPeriod === "LIFETIME" ? 
                  (isBasicPlan ? "199" : "399") : 
                  billingPeriod === "ANNUAL" ? 
                    (isBasicPlan ? "86" : "182") : 
                    (isBasicPlan ? "9" : "19");
                
                // Get price suffix based on billing period
                const priceSuffix = billingPeriod === "LIFETIME" ? 
                  " one-time" : billingPeriod === "ANNUAL" ? 
                  "/year" : "/month";
                
                return (
                  <div
                    key={plan.id}
                    className={cn(
                      "relative flex flex-col rounded-xl border p-6 transition-all hover:shadow-md",
                      isCurrentPlan && "border-[3px] border-primary bg-primary/10 shadow-md"
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
                        {isCurrentPlan && (
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                            Current Plan
                          </Badge>
                        )}
                      </div>
                      
                      {/* Plan Name and Price */}
                      <h3 className="text-xl font-semibold">{plan.name}</h3>
                      <div className="mt-2">
                        <span className="text-3xl font-bold">${price}</span>
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
                              <Link href={`/orgs/${orgSlug}/settings/subscription`}>
                                <Button 
                                  variant="default"
                                  className="w-full"
                                >
                                  Activate Plan
                                </Button>
                              </Link>
                            );
                          } else {
                            return (
                              <Button 
                                variant="outline"
                                className="w-full border-primary/50 border-2 text-primary font-medium hover:bg-primary/10"
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
                          (currentType === 'FREE' || currentType === 'FREEBIRD') || 
                          (currentType === 'BASIC' && targetType === 'PRO');
                          
                        const isDowngrade = 
                          (currentType === 'PRO' && targetType === 'BASIC') || 
                          (targetType === 'FREE' || targetType === 'FREEBIRD');
                          
                        const isBillingChange = 
                          currentType === targetType && currentCycle !== targetCycle;
                        
                        // Set button text and variant based on change type and trial status
                        let buttonText = "Change Plan";
                        let buttonVariant: "default" | "secondary" | "outline" = "default";
                        
                        // Check if user is in trial period
                        const isInTrial = trialInfo && typeof trialInfo.daysLeft === 'number' && trialInfo.daysLeft > 0;
                        
                        if (isUpgrade) {
                          buttonText = isInTrial ? "Activate This Plan" : "Upgrade to this Plan";
                          buttonVariant = "default";
                        } else if (isDowngrade) {
                          buttonText = "Downgrade to this Plan";
                          buttonVariant = "secondary"; // Using neutral secondary instead of destructive
                        } else if (isBillingChange) {
                          buttonText = `Switch to ${targetCycle.toLowerCase()} billing`;
                          buttonVariant = "outline";
                        }
                        
                        return (
                          <Link href={`/orgs/${orgSlug}/settings/subscription`}>
                            <Button 
                              variant={buttonVariant}
                              className="w-full"
                            >
                              {buttonText}
                            </Button>
                          </Link>
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
                <Link href={`/orgs/${orgSlug}/settings/subscription`}>
                  <Button size="lg" className="mt-2 px-8">
                    Activate Plan
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
