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
    <div className="grid gap-6 lg:grid-cols-2">
      {PLANS.map((plan) => (
        <Card
          key={plan.id}
          className={
            plan.isPopular
              ? "border-primary shadow-lg"
              : undefined
          }
        >
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {plan.name}
              {plan.isPopular && (
                <span className="text-xs font-normal text-primary">Popular</span>
              )}
            </CardTitle>
            <CardDescription>{plan.subtitle}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="text-3xl font-bold">
              {plan.currency} {plan.price}
              <span className="text-sm font-normal text-muted-foreground">
                {plan.type === "monthly" ? "/month" : ""}
              </span>
            </div>
            <div className="grid gap-2">
              {plan.features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-2 text-muted-foreground"
                >
                  <Check className="h-4 w-4 text-primary" />
                  {feature}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-stretch gap-2">
            <Button
              className="w-full"
              variant={plan.isPopular ? "default" : "outline"}
              disabled={
                isPending ||
                (currentPlan?.id === plan.id && subscription?.status === "active")
              }
              onClick={() => handleSubscriptionUpdate(plan.priceId)}
            >
              {currentPlan?.id === plan.id
                ? "Current Plan"
                : plan.cta}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {plan.ctaSubtitle}
            </p>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
