"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/data-display/card";
import { Button } from "@/components/core/button";
import { CreditCard, Receipt, Check } from "lucide-react";
import Link from "next/link";
import { useOrganization } from "@/query/org/org.query";
import { PLANS } from "@/features/billing/plans/plans";
import { Badge } from "@/components/data-display/badge";
import { Typography } from "@/components/data-display/typography";
import { useState } from "react";
import { Switch } from "@/components/core/switch";
import { Label } from "@/components/core/label";
import { cn } from "@/lib/utils";

interface PlanContentProps {
  orgSlug: string;
}

export function PlanContent({ orgSlug }: PlanContentProps) {
  const { organization, isLoading } = useOrganization(orgSlug);
  const [isYearly, setIsYearly] = useState(false);
  
  // Find the current plan
  const currentPlanId = organization?.plan?.id;
  const currentPlan = PLANS.find(p => p.id === currentPlanId);

  return (
    <div className="container max-w-4xl py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Plan and Billing</h2>
        <p className="text-sm text-muted-foreground">
          Manage your subscription plan and billing information
        </p>
      </div>

      {/* Subscription Plan Section */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Subscription Plan</CardTitle>
              <CardDescription>
                View and manage your current subscription plan
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
              <h3 className="text-md font-medium">Current Plan: <span className="font-bold">{currentPlan?.name || "Free"}</span></h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {currentPlan?.description || "Your organization is currently on the basic plan."}
              </p>
              <div className="mt-4">
                <Link href={`/orgs/${orgSlug}/settings/subscription`}>
                  <Button>
                    View Plan Details
                  </Button>
                </Link>
              </div>
            </div>

            {/* Available Plans */}
            <div className="mt-6">
              <Typography variant="h4" className="mb-4">Available Plans</Typography>
              
              {/* Billing Toggle */}
              <div className="flex items-center justify-end mb-4">
                <div className="flex items-center gap-2">
                  <Label className={cn("text-sm", !isYearly && "text-primary font-medium")}>Monthly</Label>
                  <Switch
                    checked={isYearly}
                    onCheckedChange={setIsYearly}
                  />
                  <Label className={cn("text-sm", isYearly && "text-primary font-medium")}>Yearly</Label>
                </div>
              </div>
              
              {/* Plans Grid */}
              <div className="grid gap-6 md:grid-cols-2">
                {PLANS.map((plan) => {
                  const isCurrentPlan = currentPlanId === plan.id;
                  const currentPrice = isYearly && plan.type === "recurring" ? plan.yearlyPrice || plan.price : plan.price;
                  
                  return (
                    <Card
                      key={plan.id}
                      className={cn(
                        "border h-full",
                        isCurrentPlan && "ring-2 ring-primary",
                      )}
                    >
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle>{plan.name}</CardTitle>
                          {isCurrentPlan && (
                            <Badge variant="outline" className="bg-primary/10 text-primary">
                              Current Plan
                            </Badge>
                          )}
                        </div>
                        <CardDescription>{plan.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <div className="flex items-baseline">
                            <span className="text-3xl font-bold">${currentPrice}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              {plan.type === "recurring" ? (isYearly ? "/year" : "/month") : " one-time"}
                            </span>
                          </div>
                        </div>
                        
                        <ul className="space-y-2 mb-6">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-primary" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        
                        <Link href={`/orgs/${orgSlug}/settings/subscription`}>
                          <Button 
                            variant={isCurrentPlan ? "outline" : "default"}
                            className="w-full"
                            disabled={isCurrentPlan}
                          >
                            {isCurrentPlan ? "Current Plan" : "Upgrade"}
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Billing Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Billing Information</CardTitle>
          <CardDescription>
            Manage your payment methods and view billing history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center space-x-4">
                <CreditCard className="h-6 w-6 text-muted-foreground" />
                <div>
                  <h3 className="text-sm font-medium">Payment Methods</h3>
                  <p className="text-xs text-muted-foreground">
                    Add or update your payment methods
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Manage
              </Button>
            </div>
            
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center space-x-4">
                <Receipt className="h-6 w-6 text-muted-foreground" />
                <div>
                  <h3 className="text-sm font-medium">Billing History</h3>
                  <p className="text-xs text-muted-foreground">
                    View your past invoices and payment history
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                View
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
