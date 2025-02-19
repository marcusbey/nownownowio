"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/core/button";
import { ENDPOINTS } from "@/lib/api/apiEndpoints";
import { Card } from "@/components/data-display/card";
import type { Organization } from "@prisma/client";
import { Spinner } from "@/components/feedback/spinner";

type BillingFormProps = {
  organization: Organization;
};

export function BillingForm({ organization }: BillingFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(ENDPOINTS.PAYMENT_CHECKOUT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: organization.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      toast.error("Failed to initiate checkout");
      console.error("Checkout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(ENDPOINTS.PAYMENT_PORTAL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: organization.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create portal session");
      }

      // Redirect to Stripe Customer Portal
      window.location.href = data.url;
    } catch (error) {
      toast.error("Failed to open billing portal");
      console.error("Portal error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Subscription Management</h2>
        <p className="text-muted-foreground">
          {organization.stripeCustomerId
            ? "Manage your subscription and billing information"
            : "Upgrade to access premium features"}
        </p>
        <div className="flex gap-4">
          {organization.stripeCustomerId ? (
            <Button
              onClick={handleManageSubscription}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? <Spinner size="small" /> : "Manage Subscription"}
            </Button>
          ) : (
            <Button onClick={handleSubscribe} disabled={isLoading}>
              {isLoading ? <Spinner size="small" /> : "Subscribe"}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
