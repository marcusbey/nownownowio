import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/helper";
import { getStripeInstance } from "@/lib/stripe";
import type Stripe from "stripe";
import { Plans } from "./Plans";
import { combineWithParentMetadata } from "@/lib/metadata";
import { prisma } from "@/lib/prisma";
import { SettingsPage, SettingsCard, SettingsSection } from "@/features/settings/SettingsLayout";
import { Typography } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/features/plans/plans";

export const generateMetadata = combineWithParentMetadata({
  title: "Subscription",
  description: "Manage your organization's subscription plan.",
});

export default async function SubscriptionPage({
  params: { orgSlug },
}: {
  params: { orgSlug: string };
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const organization = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    include: {
      plan: true
    }
  });

  if (!organization) {
    notFound();
  }

  let subscription: Stripe.Subscription | undefined = undefined;
  let upcomingInvoice: Stripe.Invoice | undefined = undefined;

  if (organization.stripeCustomerId) {
    const stripe = await getStripeInstance();
    const subscriptions = await stripe.subscriptions.list({
      customer: organization.stripeCustomerId,
      status: "active",
      expand: ["data.default_payment_method"],
      limit: 1,
    });
    subscription = subscriptions.data[0];

    if (subscription) {
      try {
        upcomingInvoice = await stripe.invoices.retrieveUpcoming({
          customer: organization.stripeCustomerId,
          subscription: subscription.id,
        });
      } catch (error) {
        // Ignore error if no upcoming invoice
      }
    }
  }

  const currentPlan = PLANS.find(p => p.id === organization.plan.id);
  const isLifetimePlan = currentPlan?.type === "lifetime";
  const isRecurringPlan = currentPlan?.type === "recurring";

  return (
    <SettingsPage
      title="Subscription"
      description="Manage your subscription plan and features"
    >
      {/* Current Plan Summary */}
      <SettingsSection title="Current Plan">
        <SettingsCard>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  {currentPlan?.name}
                  {currentPlan?.isPopular && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      Popular
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>{currentPlan?.subtitle}</CardDescription>
              </div>
              <div className="text-right">
                {isLifetimePlan ? (
                  <div className="space-y-1">
                    <Typography variant="h4">${currentPlan?.price}</Typography>
                    <Typography variant="small" className="text-muted-foreground">
                      One-time payment
                    </Typography>
                  </div>
                ) : isRecurringPlan && subscription ? (
                  <div className="space-y-1">
                    <Typography variant="h4">
                      ${(subscription.items.data[0].price.unit_amount || 0) / 100}/
                      {subscription.items.data[0].price.recurring?.interval}
                    </Typography>
                    {upcomingInvoice && (
                      <Typography variant="small" className="text-muted-foreground">
                        Next payment on {new Date(upcomingInvoice.next_payment_attempt * 1000).toLocaleDateString()}
                      </Typography>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </CardHeader>
        </SettingsCard>
      </SettingsSection>

      {/* Available Plans */}
      <SettingsSection
        title="Available Plans"
        description="Choose the plan that best fits your organization's needs"
      >
        <Plans 
          currentPlan={organization.plan} 
          subscription={subscription}
          organizationId={organization.id}
        />
      </SettingsSection>
    </SettingsPage>
  );
}
