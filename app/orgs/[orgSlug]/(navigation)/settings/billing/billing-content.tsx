"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/data-display/card";
import { Button } from "@/components/core/button";
import { CreditCard, Receipt } from "lucide-react";
import { useState } from "react";
import { useOrganization } from "@/query/org/org.query";

type BillingContentProps = {
  orgSlug: string;
}

export function BillingContent({ orgSlug }: BillingContentProps) {
  const { organization, isLoading } = useOrganization(orgSlug);
  const [showInvoices, setShowInvoices] = useState(false);

  // Mock data - in a real app, this would come from an API
  type Invoice = {
    id: string;
    date: string;
    amount: number;
  };

  const invoices: Invoice[] = [];

  return (
    <div className="py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Billing Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your billing information
        </p>
      </div>

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
                <Receipt className="size-6 text-muted-foreground" />
                <div>
                  <h3 className="text-sm font-medium">Invoices</h3>
                  <p className="text-xs text-muted-foreground">
                    View and download your past invoices
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowInvoices(!showInvoices)}
              >
                {showInvoices ? "Hide" : "View"}
              </Button>
            </div>

            {/* Invoice list - shows when toggled */}
            {showInvoices && (
              <div className="mt-4 rounded-lg border p-4">
                {invoices.length > 0 ? (
                  <div className="space-y-2">
                    {invoices.map((invoice, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between border-b py-2 last:border-0"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            Invoice #{invoice.id}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {invoice.date}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <p className="text-sm font-medium">
                            ${invoice.amount}
                          </p>
                          <Button variant="ghost" size="sm">
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      No invoices available yet.
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Your invoice history will appear here once you have
                      billing activity.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Billing address */}
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-medium">Billing Address</h3>
              <div className="rounded-lg border p-4">
                {organization?.stripeCustomerId ? (
                  <div className="space-y-1">
                    <p className="text-sm">{organization.name}</p>
                    <p className="text-sm text-muted-foreground">
                      123 Business Street
                    </p>
                    <p className="text-sm text-muted-foreground">Suite 101</p>
                    <p className="text-sm text-muted-foreground">
                      San Francisco, CA 94103
                    </p>
                    <p className="text-sm text-muted-foreground">
                      United States
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Update
                    </Button>
                  </div>
                ) : (
                  <div className="py-4 text-center">
                    <p className="mb-2 text-sm text-muted-foreground">
                      No billing address on file
                    </p>
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
