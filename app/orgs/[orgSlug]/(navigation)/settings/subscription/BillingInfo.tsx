"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Organization } from "@prisma/client";
import type Stripe from "stripe";
import { toast } from "sonner";
import { useTransition } from "react";
import { manageBilling } from "./actions";

interface BillingInfoProps {
  organization: Organization;
  subscription?: Stripe.Subscription;
}

export function BillingInfo({ organization, subscription }: BillingInfoProps) {
  const [isPending, startTransition] = useTransition();

  const handleManageBilling = async () => {
    try {
      startTransition(async () => {
        const result = await manageBilling(organization.id);
        if (result.url) {
          window.location.href = result.url;
        }
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to access billing portal");
    }
  };

  if (!organization.stripeCustomerId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No billing information</CardTitle>
          <CardDescription>
            You haven't set up billing yet. Add a payment method to upgrade your plan.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing Information</CardTitle>
        <CardDescription>
          Manage your billing information and view payment history
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscription && (
          <>
            <div>
              <div className="text-sm font-medium">Subscription Status</div>
              <div className="text-sm text-muted-foreground capitalize">
                {subscription.status}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">Next Payment</div>
              <div className="text-sm text-muted-foreground">
                {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
              </div>
            </div>
            {subscription.default_payment_method && (
              <div>
                <div className="text-sm font-medium">Payment Method</div>
                <div className="text-sm text-muted-foreground">
                  {(subscription.default_payment_method as Stripe.PaymentMethod).card?.brand?.toUpperCase()}{" "}
                  ending in {(subscription.default_payment_method as Stripe.PaymentMethod).card?.last4}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          onClick={handleManageBilling}
          disabled={isPending}
        >
          Manage Billing
        </Button>
      </CardFooter>
    </Card>
  );
}
