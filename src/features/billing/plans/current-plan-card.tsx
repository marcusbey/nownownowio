"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/data-display/card";
import { Badge } from "@/components/data-display/badge";
import { Button } from "@/components/core/button";
import { BillingCycle, PlanType, formatBillingCycle, formatPlanType, getPlanFeatures } from "@/features/billing/plans/plans";
import { Infinity, Check } from "lucide-react";
import { PlanBuyButton } from "../payments/buy-button";

interface CurrentPlanCardProps {
  planType: PlanType;
  billingCycle: BillingCycle;
  orgSlug: string;
  expiresAt?: Date | null;
  isActive: boolean;
}

/**
 * Displays the current plan information for an organization
 * Shows plan type, billing cycle, expiration, and key features
 */
export function CurrentPlanCard({
  planType,
  billingCycle,
  orgSlug,
  expiresAt,
  isActive
}: CurrentPlanCardProps): JSX.Element {
  const planFeatures = getPlanFeatures(planType);
  const formattedPlanType = formatPlanType(planType);
  const formattedBillingCycle = formatBillingCycle(billingCycle);
  
  // Format expiration date if available
  const formattedExpiresAt = expiresAt 
    ? new Date(expiresAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">{formattedPlanType} Plan</CardTitle>
            <CardDescription className="mt-1">
              {billingCycle === "LIFETIME" 
                ? "Lifetime Access" 
                : `${formattedBillingCycle} billing`}
            </CardDescription>
          </div>
          <Badge variant={isActive ? "default" : "destructive"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {expiresAt && (
            <div className="text-sm">
              <span className="text-muted-foreground">Expires: </span>
              <span className="font-medium">{formattedExpiresAt}</span>
            </div>
          )}
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Plan Limits</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                {planFeatures.maximumOrganizations === Infinity ? (
                  <span>Unlimited organizations</span>
                ) : (
                  <span>Up to {planFeatures.maximumOrganizations} organizations</span>
                )}
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                {planFeatures.maximumMembers === Infinity ? (
                  <span>Unlimited members</span>
                ) : (
                  <span>Up to {planFeatures.maximumMembers} members per organization</span>
                )}
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                {planFeatures.maximumWidgets === Infinity ? (
                  <span>Unlimited widgets</span>
                ) : (
                  <span>Up to {planFeatures.maximumWidgets} widgets</span>
                )}
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                {planFeatures.monthlyViews === Infinity ? (
                  <span>Unlimited monthly views</span>
                ) : (
                  <span>Up to {planFeatures.monthlyViews.toLocaleString()} monthly views</span>
                )}
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {planType !== "PRO" && (
          <PlanBuyButton 
            planType="PRO" 
            billingCycle={billingCycle === "LIFETIME" ? "ANNUAL" : billingCycle}
            orgSlug={orgSlug}
            variant="outline"
          >
            Upgrade to Pro
          </PlanBuyButton>
        )}
        
        {planType === "FREE" && (
          <PlanBuyButton 
            planType="BASIC" 
            billingCycle="MONTHLY"
            orgSlug={orgSlug}
            variant="default"
          >
            Upgrade to Basic
          </PlanBuyButton>
        )}
        
        {planType !== "FREE" && billingCycle !== "LIFETIME" && (
          <Button variant="ghost" asChild>
            <a href={`/orgs/${orgSlug}/settings/billing`}>Manage Subscription</a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
