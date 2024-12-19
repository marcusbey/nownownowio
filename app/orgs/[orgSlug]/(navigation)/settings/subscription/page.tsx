import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout, LayoutContent, LayoutHeader, LayoutTitle } from "@/features/page/layout";
import { Plans } from "./Plans";
import { BillingInfo } from "./BillingInfo";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/helper";
import { stripe } from "@/lib/stripe";

export default async function SubscriptionPage({
  params: { orgSlug },
}: {
  params: { orgSlug: string };
}) {
  const session = await auth();
  if (!session?.user) return null;

  const organization = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    include: {
      plan: true,
    },
  });

  if (!organization) {
    notFound();
  }

  let subscription = null;
  if (organization.stripeCustomerId) {
    subscription = await stripe.subscriptions.list({
      customer: organization.stripeCustomerId,
      status: "active",
      expand: ["data.default_payment_method"],
    });
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
              subscription={subscription?.data[0]}
              organizationId={organization.id}
            />
          </TabsContent>

          <TabsContent value="billing" className="mt-6">
            <BillingInfo 
              organization={organization}
              subscription={subscription?.data[0]}
            />
          </TabsContent>
        </Tabs>
      </LayoutContent>
    </Layout>
  );
}
