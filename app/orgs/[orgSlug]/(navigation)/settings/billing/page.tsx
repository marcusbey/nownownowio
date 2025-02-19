import {
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/data-display/card";
import { Button } from "@/components/core/button";
import { Typography } from "@/components/data-display/typography";
import { formatDate } from "@/lib/format/date";
import { combineWithParentMetadata } from "@/lib/metadata";
import type Stripe from "stripe";
import { getStripeInstance } from "@/lib/stripe";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";
import { OrganizationMembershipRole } from "@prisma/client";
import { CreditCard, Receipt } from "lucide-react";
import type { PageParams } from "@/types/next";
import { SettingsPage, SettingsCard, SettingsSection } from "@/components/layout/SettingsLayout";

export const generateMetadata = combineWithParentMetadata({
  title: "Billing & Payment",
  description: "Manage your payment methods and view billing history.",
});

export default async function BillingPage({ params }: PageParams) {
  const { org: organization } = await getRequiredCurrentOrgCache(undefined, [
    OrganizationMembershipRole.ADMIN,
  ]);

  if (!organization.stripeCustomerId) {
    throw new Error("Organization has no Stripe customer");
  }

  // Get active subscription and payment method
  const stripe = await getStripeInstance();
  const subscriptions = await stripe.subscriptions.list({
    customer: organization.stripeCustomerId,
    status: "active",
    expand: ["data.default_payment_method"],
    limit: 1,
  });
  const subscription = subscriptions.data[0];
  const paymentMethod = subscription?.default_payment_method as Stripe.PaymentMethod | undefined;

  // Get recent invoices
  const invoices = await stripe.invoices.list({
    customer: organization.stripeCustomerId,
    limit: 5,
  });

  return (
    <SettingsPage
      title="Billing & Payment"
      description="Manage your payment methods and view billing history"
    >
      {/* Payment Method Section */}
      <SettingsSection
        title="Payment Method"
        description="Manage your payment method and billing preferences"
      >
        <SettingsCard>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <CardTitle>Payment Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {paymentMethod ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-md border p-2">
                    {paymentMethod.card?.brand.toUpperCase()}
                  </div>
                  <div>
                    <Typography variant="default">•••• {paymentMethod.card?.last4}</Typography>
                    <Typography variant="small" className="text-muted-foreground">
                      Expires {paymentMethod.card?.exp_month}/{paymentMethod.card?.exp_year}
                    </Typography>
                  </div>
                </div>
                <Button variant="outline" asChild>
                  <a href={`${process.env.NEXT_PUBLIC_URL}/api/v1/stripe/portal/${organization.id}`} target="_blank" rel="noopener noreferrer">
                    Update
                  </a>
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <Typography variant="default">No payment method on file</Typography>
                <Button asChild>
                  <a href={`${process.env.NEXT_PUBLIC_URL}/api/v1/stripe/portal/${organization.id}`} target="_blank" rel="noopener noreferrer">
                    Add Payment Method
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </SettingsCard>
      </SettingsSection>

      {/* Billing History Section */}
      <SettingsSection
        title="Billing History"
        description="View your billing history and download invoices"
      >
        <SettingsCard>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              <CardTitle>Recent Invoices</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {invoices.data.length > 0 ? (
              <div className="space-y-4">
                {invoices.data.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between py-4 border-b pb-4 last:border-0">
                    <div>
                      <Typography variant="default">
                        {formatDate(new Date(invoice.created * 1000))}
                      </Typography>
                      <Typography variant="small" className="text-muted-foreground">
                        ${(invoice.amount_paid / 100).toFixed(2)} - {invoice.status}
                      </Typography>
                    </div>
                    {invoice.hosted_invoice_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={invoice.hosted_invoice_url} target="_blank" rel="noopener noreferrer">
                          View Invoice
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
                <div className="pt-4">
                  <Button variant="outline" className="w-full" asChild>
                    <a href={`${process.env.NEXT_PUBLIC_URL}/api/v1/stripe/portal/${organization.id}`} target="_blank" rel="noopener noreferrer">
                      View All Invoices
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <Typography variant="default" className="text-muted-foreground">
                No billing history available
              </Typography>
            )}
          </CardContent>
        </SettingsCard>
      </SettingsSection>
    </SettingsPage>
  );
}
