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
import { Typography } from "@/components/ui/typography";
import { Check } from "lucide-react";
import { PLANS } from "@/features/plans/plans";
import type { OrganizationPlan } from "@prisma/client";
import type Stripe from "stripe";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateSubscription } from "./actions";
import { useTransition } from "react";

interface PlansProps {
  currentPlan: OrganizationPlan | null;
  subscription?: Stripe.Subscription;
  organizationId: string;
}

export function Plans({ currentPlan, subscription, organizationId }: PlansProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubscriptionUpdate = async (priceId: string) => {
    try {
      startTransition(async () => {
        const result = await updateSubscription(organizationId, priceId);
        if (result.url) {
          window.location.href = result.url;
        }
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update subscription");
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Typography variant="h3">Choose Your Plan</Typography>
        <Typography variant="muted">
          Select the plan that best fits your organization's needs
        </Typography>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {PLANS.map((plan) => {
          const isCurrentPlan = currentPlan?.id === plan.id;
          const buttonDisabled = isCurrentPlan || isPending;

          return (
            <Card
              key={plan.id}
              className={plan.isPopular ? "border-primary shadow-lg relative" : "relative"}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-0 right-0 mx-auto w-fit rounded-full bg-primary px-3 py-1">
                  <Typography variant="small" className="text-primary-foreground">
                    Most Popular
                  </Typography>
                </div>
              )}

              <CardHeader>
                <CardTitle className="flex items-baseline justify-between">
                  <span>{plan.name}</span>
                  <div className="flex items-baseline gap-1">
                    <Typography variant="h3">${plan.price}</Typography>
                    <Typography variant="small" className="text-muted-foreground">/mo</Typography>
                  </div>
                </CardTitle>
                <CardDescription>{plan.subtitle}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <Typography variant="small">{feature}</Typography>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  size="lg"
                  variant={plan.isPopular ? "default" : "outline"}
                  disabled={buttonDisabled}
                  onClick={() => handleSubscriptionUpdate(plan.priceId)}
                >
                  {isCurrentPlan
                    ? "Current Plan"
                    : subscription
                    ? "Change Plan"
                    : "Get Started"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
