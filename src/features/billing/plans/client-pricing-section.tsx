import { Button } from "@/components/core/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/data-display/card";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for small teams and individuals",
    features: [
      "Up to 5 team members",
      "Basic post features",
      "Community support",
      "Standard analytics",
    ],
    action: "Current Plan",
    disabled: true,
  },
  {
    name: "Pro",
    price: "$10",
    description: "Best for growing organizations",
    features: [
      "Unlimited team members",
      "Advanced post features",
      "Priority support",
      "Advanced analytics",
      "Custom branding",
      "API access",
    ],
    action: "Upgrade",
    disabled: false,
  },
];

interface ClientPricingSectionProps {
  currentPlan?: string;
}

export function ClientPricingSection({ currentPlan = "free" }: ClientPricingSectionProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {plans.map((plan) => (
        <Card key={plan.name} className="flex flex-col">
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="text-3xl font-bold">{plan.price}</div>
            <p className="text-sm text-muted-foreground">per month</p>
            <ul className="mt-4 space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant={plan.name.toLowerCase() === currentPlan ? "outline" : "default"}
              disabled={plan.disabled || plan.name.toLowerCase() === currentPlan}
            >
              {plan.action}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
