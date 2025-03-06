"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/data-display/card";
import { Button } from "@/components/core/button";
import { CreditCard, Receipt } from "lucide-react";
import Link from "next/link";
import { useOrganization } from "@/query/org/org.query";

interface BillingContentProps {
  orgSlug: string;
}

export function BillingContent({ orgSlug }: BillingContentProps) {
  const { organization, isLoading } = useOrganization(orgSlug);

  return (
    <div className="py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Billing Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your payment methods and billing information
        </p>
      </div>

      {/* Billing Information Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Payment Methods</CardTitle>
          <CardDescription>
            Manage your payment methods for subscription billing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center space-x-4">
                <CreditCard className="h-6 w-6 text-muted-foreground" />
                <div>
                  <h3 className="text-sm font-medium">Credit/Debit Cards</h3>
                  <p className="text-xs text-muted-foreground">
                    Add or update your payment cards
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Manage
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Billing History Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Billing History</CardTitle>
          <CardDescription>
            View your past invoices and payment history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center space-x-4">
                <Receipt className="h-6 w-6 text-muted-foreground" />
                <div>
                  <h3 className="text-sm font-medium">Invoices</h3>
                  <p className="text-xs text-muted-foreground">
                    View and download your past invoices
                  </p>
                </div>
              </div>
              <Link href={`/orgs/${orgSlug}/settings/billing/invoices`}>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </Link>
            </div>
            
            {/* Billing address */}
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Billing Address</h3>
              <div className="rounded-lg border p-4">
                {organization?.stripeCustomerId ? (
                  <div className="space-y-1">
                    <p className="text-sm">{organization.name}</p>
                    <p className="text-sm text-muted-foreground">123 Business Street</p>
                    <p className="text-sm text-muted-foreground">Suite 101</p>
                    <p className="text-sm text-muted-foreground">San Francisco, CA 94103</p>
                    <p className="text-sm text-muted-foreground">United States</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Update
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-2">No billing address on file</p>
                    <Button variant="outline" size="sm">
                      Add Billing Address
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
