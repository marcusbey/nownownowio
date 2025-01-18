import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/helper";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";
import { Plans } from "./Plans";
import { combineWithParentMetadata } from "@/lib/metadata";
import { prisma } from "@/lib/prisma";
import { SettingsPage, SettingsCard, SettingsSection } from "@/features/settings/SettingsLayout";

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
  if (organization.stripeCustomerId) {
    const subscriptions = await stripe.subscriptions.list({
      customer: organization.stripeCustomerId,
      status: "active",
      expand: ["data.default_payment_method"],
      limit: 1,
    });
    subscription = subscriptions.data[0];
  }

  return (
    <SettingsPage
      title="Subscription"
      description="Manage your subscription plan and features"
    >
      {/* Current Plan Summary */}
      <SettingsSection title="Current Plan">
        <SettingsCard>
          <CardHeader>
            <CardTitle>Current Plan: {organization.plan.name}</CardTitle>
            <CardDescription>
              {organization.plan.id === "FREE" 
                ? "Upgrade to premium to unlock all features."
                : "You are currently on the premium plan."}
            </CardDescription>
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
