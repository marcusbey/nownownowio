"use client";

import { Button } from "@/components/core/button";
import { Card } from "@/components/data-display/card";
import { Typography } from "@/components/data-display/typography";
import { Check } from "lucide-react";
import { PLANS } from "@/features/billing/plans/plans";
import type { OrganizationPlan } from "@prisma/client";
import type Stripe from "stripe";
import { toast } from "sonner";

import { updateSubscription } from "./actions";
import { useTransition, useState } from "react";
import { Badge } from "@/components/data-display/badge";
import { Switch } from "@/components/core/switch";
import { Label } from "@/components/core/label";
import { cn } from "@/lib/utils";
import { usePlanPricing } from "@/features/billing/plans/plan-pricing-context";

type PlansProps = {
  currentPlan: OrganizationPlan | null;
  subscription?: Stripe.Subscription;
  organizationId: string;
  isTrialPeriod?: boolean;
}

export function Plans({ currentPlan, subscription, organizationId, isTrialPeriod = false }: PlansProps) {
  const [isPending, startTransition] = useTransition();
  const [isYearly, setIsYearly] = useState(false);
  
  // Use the plan pricing context
  const { isLoading: isPricesLoading, getPriceAmount } = usePlanPricing();

  const handleSubscriptionUpdate = async (priceId: string) => {
    try {
      startTransition(async () => {
        const result = await updateSubscription(organizationId, priceId);
        if (result.url) {
          window.location.href = result.url;
        }
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update subscription");
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        {PLANS.map((plan) => {
          // Check if this is the current plan by comparing with the organization's plan ID
          // This ensures the correct plan is highlighted
          const isCurrentPlan = currentPlan?.id === plan.id;
          const buttonDisabled = isCurrentPlan || isPending || !plan.yearlyPriceId || !plan.priceId;
          // Determine if plan is recurring based on having both monthly and yearly prices
          const isRecurring = Boolean(plan.yearlyPrice) && Boolean(plan.yearlyPriceId);
          const currentPrice = isYearly && isRecurring ? plan.yearlyPrice ?? plan.price : plan.price;
          const currentPriceId = isYearly && isRecurring ? plan.yearlyPriceId ?? plan.priceId : plan.priceId;
          const monthlyPrice = plan.price ?? 0;
          const yearlyPrice = plan.yearlyPrice;
          const yearlyMonthlyPrice = yearlyPrice ? yearlyPrice / 12 : null;
          const savings = monthlyPrice && yearlyMonthlyPrice ? Math.round((1 - yearlyMonthlyPrice / monthlyPrice) * 100) : 0;

          return (
            <Card
              key={plan.id}
              className={cn(
                "border-[0.5px] h-fit lg:rounded-3xl rounded-3xl flex-1 p-6 ring-1 ring-gray-900/10 sm:p-8",
                {
                  "relative bg-background shadow-2xl": plan.isPopular,
                  "bg-background/60": !plan.isPopular,
                },
                plan.className,
              )}
            >
              {plan.isPopular && (
                <div className="absolute inset-x-0 top-0 flex items-center justify-center">
                  <Badge className="-translate-y-1/2">Popular</Badge>
                </div>
              )}
              
              <div className="flex flex-col gap-8">
                {/* Header Section */}
                <div className="space-y-2">
                  <p className="text-lg font-bold uppercase text-primary">
                    {plan.name}
                  </p>
                  <Typography variant="muted">{plan.subtitle ?? plan.description}</Typography>
                </div>

                {/* Pricing Section - Fixed Height */}
                <div className="space-y-6">
                  {/* Toggle or Info Box */}
                  {plan.yearlyPrice && plan.yearlyPriceId ? (
                    <div className="flex items-center justify-between gap-2 rounded-lg bg-muted/30 p-2">
                      <div className="flex items-center gap-2">
                        <Label className={cn("text-sm", !isYearly && "text-primary font-medium")}>Monthly</Label>
                        <Switch
                          checked={isYearly}
                          onCheckedChange={setIsYearly}
                          className="data-[state=checked]:bg-primary"
                        />
                        <Label className={cn("text-sm", isYearly && "text-primary font-medium")}>Yearly</Label>
                      </div>
                      {yearlyMonthlyPrice && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground line-through">${monthlyPrice}/mo</span>
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-primary">${yearlyMonthlyPrice.toFixed(2)}/mo</span>
                            {isYearly && savings > 0 && (
                              <Badge variant="secondary" className="whitespace-nowrap bg-green-500/10 text-xs text-green-600">
                                Save {savings}%
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2 rounded-lg bg-muted/30 p-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="whitespace-nowrap bg-yellow-500/10 text-xs text-yellow-600">
                          Best value
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        One-time payment
                      </div>
                    </div>
                  )}

                  {/* Price Display */}
                  <div className="flex h-24 items-center justify-center">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-3xl font-medium">$</span>
                      <span className="text-6xl font-extrabold tracking-tight">
                        {isPricesLoading
                          ? typeof currentPrice === 'number' ? currentPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '--'
                          : (getPriceAmount(plan.planType, isYearly ? 'ANNUAL' : 'MONTHLY') || 
                            (typeof currentPrice === 'number' ? currentPrice : 0)).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </span>
                      <span className="text-lg text-muted-foreground">
                        {plan.currency ?? "USD"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-border" />

                {/* Features List */}
                <ul className="flex flex-col gap-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="shrink-0 text-green-500" size={18} />
                      <Typography variant="muted" className="flex-1">
                        {feature}
                      </Typography>
                    </li>
                  ))}
                </ul>

                {/* Footer */}
                <div className="flex flex-col gap-3">
                  <Button
                    className="w-full"
                    size="lg"
                    variant={plan.isPopular ? "default" : "outline"}
                    disabled={buttonDisabled}
                    onClick={async () => {
                      if (currentPriceId) {
                        await handleSubscriptionUpdate(currentPriceId);
                      }
                    }}
                  >
                    {isCurrentPlan
                      ? (isTrialPeriod ? "Activate Plan" : "Current Plan")
                      : subscription
                      ? "Change Plan"
                      : "Get Started"}
                  </Button>
                  <Typography variant="small" className="text-center text-muted-foreground">
                    {plan.yearlyPrice && plan.yearlyPriceId
                      ? (isYearly ? "Billed yearly" : "Billed monthly") 
                      : "One-time payment"}
                  </Typography>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
