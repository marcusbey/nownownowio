'use client';

import { CardDescription, CardHeader, CardTitle } from "@/components/data-display/card";
import { Typography } from "@/components/data-display/typography";
import { Badge } from "@/components/data-display/badge";
import { PLANS } from "@/features/billing/plans/plans";
import { ClientPricingSection } from "@/features/billing/plans/client-pricing-section";
import { SettingsPage, SettingsCard, SettingsSection } from "@/components/layout/SettingsLayout";
import { useOrganization } from "@/query/org/org.query";
import { useParams } from "next/navigation";

export default function SubscriptionPage() {
  const params = useParams();
  const { organization, isLoading } = useOrganization(params.orgSlug as string);
  
  if (isLoading) {
    return (
      <SettingsPage>
        <div className="flex items-center justify-center h-96">
          <Typography variant="muted">Loading...</Typography>
        </div>
      </SettingsPage>
    );
  }

  if (!organization) {
    return (
      <SettingsPage>
        <div className="flex items-center justify-center h-96">
          <Typography variant="muted">Organization not found</Typography>
        </div>
      </SettingsPage>
    );
  }

  const currentPlan = PLANS.find(p => p.id === organization.plan?.id);

  return (
    <SettingsPage
      title="Subscription"
      description="Manage your organization's subscription plan."
    >
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
        <ClientPricingSection variant="compact" />
      </SettingsSection>
    </SettingsPage>
  );
}
