import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout, LayoutContent, LayoutHeader, LayoutTitle } from "@/features/page/layout";
import { Plans } from "./Plans";
import { BillingInfo } from "./BillingInfo";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/helper";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";

export default async function SubscriptionPage({
  params: { orgSlug },
}: {
  params: { orgSlug: string };
}) {
  const session = await auth();
  if (!session?.id) return null;

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
    <Layout>
      <LayoutHeader>
        <LayoutTitle>Subscription</LayoutTitle>
      </LayoutHeader>
      <LayoutContent>
        <Tabs defaultValue="plans" className="w-full">
          <TabsList>
            <TabsTrigger value="plans">Plans</TabsTrigger>
            <TabsTrigger value="billing">Billing & Payment</TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="mt-6">
            <Plans 
              currentPlan={organization.plan}
              subscription={subscription}
              organizationId={organization.id}
            />
          </TabsContent>

          <TabsContent value="billing" className="mt-6">
            <BillingInfo 
              organization={organization}
              subscription={subscription}
            />
          </TabsContent>
        </Tabs>
      </LayoutContent>
    </Layout>
  );
}
