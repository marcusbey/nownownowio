'use client';

import { CardDescription, CardHeader, CardTitle } from "@/components/data-display/card";
import { Typography } from "@/components/data-display/typography";
import { Badge } from "@/components/data-display/badge";
import { PLANS } from "@/features/billing/plans/plans";
import { TRIAL_PERIOD_DAYS } from "@/features/billing/plans/plan-constants";
import { Plans } from "./Plans";
import { SettingsPage, SettingsCard, SettingsSection } from "@/components/layout/SettingsLayout";
import { useOrganization } from "@/query/org/org.query";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { addDays, differenceInDays } from "date-fns";
import type { OrganizationPlan } from "@prisma/client";

export default function SubscriptionPage() {
  const params = useParams();
  // Extract orgSlug from params and ensure it's a string
  const orgSlug = Array.isArray(params.orgSlug) ? params.orgSlug[0] : params.orgSlug as string;
  const { organization, isLoading } = useOrganization(orgSlug);
  const [isTrialPeriod, setIsTrialPeriod] = useState(false);
  
  // Calculate if the user is in a trial period
  useEffect(() => {
    if (organization && organization.plan && organization.plan.createdAt && organization.plan.id && !organization.plan.id.startsWith('FREE')) {
      // Use plan creation date as trial start date
      const trialStartDate = new Date(organization.plan.createdAt);
      const trialEndDate = addDays(trialStartDate, TRIAL_PERIOD_DAYS);
      const daysLeft = differenceInDays(trialEndDate, new Date());
      
      setIsTrialPeriod(daysLeft > 0);
    }
  }, [organization]);
  
  if (isLoading) {
    return (
      <SettingsPage>
        <div className="flex h-96 items-center justify-center">
          <Typography variant="muted">Loading...</Typography>
        </div>
      </SettingsPage>
    );
  }

  if (!organization) {
    return (
      <SettingsPage>
        <div className="flex h-96 items-center justify-center">
          <Typography variant="muted">Organization not found</Typography>
        </div>
      </SettingsPage>
    );
  }

  const currentPlan = PLANS.find(p => p.id === organization.plan?.id);

  // Convert API response to OrganizationPlan type
  const convertToPlanType = (plan: typeof organization.plan) => {
    if (!plan) return null;
    
    // Use type assertion to handle the enum type incompatibility
    return {
      ...plan,
      createdAt: new Date(plan.createdAt),
      updatedAt: new Date(plan.updatedAt)
    } as OrganizationPlan;
  };
  
  return (
    <SettingsPage>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Subscription</h1>
        <p className="text-sm text-muted-foreground">
          Manage your organization's subscription plan.
        </p>
      </div>
      <SettingsSection>
        <SettingsCard>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>
                  You are currently on the {currentPlan?.name || "Free"} plan
                </CardDescription>
              </div>
              {currentPlan?.id.startsWith('FREEBIRD') && (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Free Bird
                </Badge>
              )}
            </div>
          </CardHeader>
        </SettingsCard>
      </SettingsSection>

      <SettingsSection>
        <Typography variant="h4" className="mb-6">Available Plans</Typography>
        {organization && (
          <Plans 
            currentPlan={convertToPlanType(organization.plan)} 
            organizationId={organization.id}
            isTrialPeriod={isTrialPeriod}
          />
        )}
      </SettingsSection>
    </SettingsPage>
  );
}
