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
import { usePlanPricing, FALLBACK_PRICES } from "@/features/billing/plans/plan-pricing-context";

type PlanContentProps = {
  orgSlug: string;
};

export function PlanContent({ orgSlug }: PlanContentProps) {
  const { organization } = useOrganization(orgSlug);
  const [billingPeriod, setBillingPeriod] = useState<BillingCycle>("MONTHLY");
  const [trialInfo, setTrialInfo] = useState<{ daysLeft: number; expiryDate: Date | null }>({ 
    daysLeft: 0, 
    expiryDate: null 
  });
  
  // Use the plan pricing context for dynamic pricing
  const { isLoading: isPricesLoading, getPriceAmount } = usePlanPricing();
  
  // Find the current plan
  const currentPlanId = organization?.plan?.id;
  const currentPlan = PLANS.find(p => p.id === currentPlanId);
  
  // Calculate trial period information
  useEffect(() => {
    if (organization?.plan?.createdAt && currentPlanId && !currentPlanId.startsWith('FREE')) {
      // Use plan creation date as trial start date
      const trialStartDate = new Date(organization.plan.createdAt);
      const trialEndDate = addDays(trialStartDate, 7); // 7-day trial
      const daysLeft = differenceInDays(trialEndDate, new Date());
      
      setTrialInfo({
        daysLeft: Math.max(0, daysLeft),
        expiryDate: trialEndDate
      });
    }
  }, [organization, currentPlanId]);
  
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
          View and manage your subscription plan
        </p>
      </div>

      {/* Current Subscription Section */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Current Subscription</CardTitle>
              <CardDescription>
                View details about your current plan
              </CardDescription>
            </div>
            {currentPlanId?.startsWith('FREEBIRD') && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Free Bird
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Current Plan */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-medium">Current Plan: <span className="font-bold">{currentPlan?.name ?? "Free"}</span></h3>
                <div className="flex gap-2">
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
              <p className="mt-1 text-sm text-muted-foreground">
                {currentPlan?.description ?? "Your organization is currently on the free plan."}
              </p>
              {/* Show trial info if on a paid plan */}
              {currentPlanId && !currentPlanId.startsWith('FREE') && (
                <div className="mt-3 rounded-md bg-primary/5 p-2 text-xs">
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
                      <Button size="sm" variant="default" className="w-full">
                        Upgrade Now
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans with New Design */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available Plans</CardTitle>
          <CardDescription>
            Compare and upgrade to a different plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 rounded-lg border p-6">
            <div className="space-y-3 px-1">
              <h3 className="pl-1 text-lg font-medium">Select Your Plan</h3>
              <p className="text-sm text-muted-foreground">Choose the plan that works best for your project</p>
              <div className="mt-2 flex items-center justify-center rounded-md bg-primary/10 p-2 text-sm text-primary">
                <span className="mr-2 rounded border border-primary/30 px-1 py-0.5 text-xs font-medium text-primary">INFO</span>
                <span>All plans include a 7-day free trial. No credit card required.</span>
              </div>
            </div>

            {/* Billing Period Selector */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Billing Period</label>
              <div className="mx-auto flex max-w-xs overflow-hidden rounded-lg border bg-background/80">
                <div
                  className={cn(
                    "flex-1 cursor-pointer px-4 py-2 text-center transition-all",
                    billingPeriod === "MONTHLY" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  )}
                  onClick={() => setBillingPeriod("MONTHLY")}
                >
                  <div className="font-medium">Monthly</div>
                </div>
                <div
                  className={cn(
                    "flex-1 cursor-pointer px-4 py-2 text-center transition-all",
                    billingPeriod === "ANNUAL" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  )}
                  onClick={() => setBillingPeriod("ANNUAL")}
                >
                  <div className="font-medium">Yearly</div>
                </div>
                <div
                  className={cn(
                    "flex-1 cursor-pointer px-4 py-2 text-center transition-all",
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

            {/* Plans Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              {filteredPlans.map((plan) => {
                const isCurrentPlan = currentPlanId === plan.id;
                const isBasicPlan = plan.planType === "BASIC";
                const isProPlan = plan.planType === "PRO";
                
                return (
                  <div
                    key={plan.id}
                    className={cn(
                      "flex cursor-pointer flex-col rounded-lg border p-4 transition-all hover:border-primary",
                      isCurrentPlan && "border-2 border-primary bg-primary/5",
                      !isCurrentPlan && "opacity-90 hover:opacity-100"
                    )}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="font-semibold">{plan.name}</h4>
                      {isProPlan && (
                        <div className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">Popular</div>
                      )}
                      {isCurrentPlan && (
                        <Badge variant="outline" className="bg-primary/10 text-primary">
                          Current Plan
                        </Badge>
                      )}
                    </div>
                    <div className="mb-2">
                      <span className="text-2xl font-bold">
                        ${isPricesLoading ? 
                          // Use fallback prices during loading
                          (billingPeriod === "LIFETIME" ? 
                            (isBasicPlan ? FALLBACK_PRICES.BASIC.LIFETIME : FALLBACK_PRICES.PRO.LIFETIME) : 
                            billingPeriod === "ANNUAL" ? 
                              (isBasicPlan ? FALLBACK_PRICES.BASIC.ANNUAL : FALLBACK_PRICES.PRO.ANNUAL) : 
                              (isBasicPlan ? FALLBACK_PRICES.BASIC.MONTHLY : FALLBACK_PRICES.PRO.MONTHLY)) :
                          // Use prices from API
                          getPriceAmount(isBasicPlan ? "BASIC" : "PRO", billingPeriod) || 
                          // Fallback if price not found
                          (billingPeriod === "LIFETIME" ? 
                            (isBasicPlan ? FALLBACK_PRICES.BASIC.LIFETIME : FALLBACK_PRICES.PRO.LIFETIME) : 
                            billingPeriod === "ANNUAL" ? 
                              (isBasicPlan ? FALLBACK_PRICES.BASIC.ANNUAL : FALLBACK_PRICES.PRO.ANNUAL) : 
                              (isBasicPlan ? FALLBACK_PRICES.BASIC.MONTHLY : FALLBACK_PRICES.PRO.MONTHLY))}
                      </span>
                      <span className="text-muted-foreground">
                        {billingPeriod === "LIFETIME" ? " one-time" : 
                         billingPeriod === "ANNUAL" ? "/year" : "/month"}
                      </span>
                      {billingPeriod === "ANNUAL" && (
                        <span className="ml-2 rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">Save 20%</span>
                      )}
                    </div>
                    <ul className="mb-4 space-y-2 text-sm">
                      {plan.features.map((feature, i) => {
                        const isDisabled = feature.includes("Powered by") && feature.includes("branding");
                        return (
                          <li key={i} className="flex items-center">
                            {!isDisabled ? (
                              <CheckCircle2 className="mr-2 size-4 text-green-500" />
                            ) : (
                              <XCircle className="mr-2 size-4 text-muted-foreground" />
                            )}
                            <span className={cn(isDisabled && "text-muted-foreground")}>{feature}</span>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="mt-auto">
                      <Link href={`/orgs/${orgSlug}/settings/subscription`}>
                        <Button 
                          variant={isCurrentPlan ? "outline" : "default"}
                          className="w-full"
                          disabled={isCurrentPlan}
                        >
                          {isCurrentPlan ? "Current Plan" : "Upgrade"}
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
