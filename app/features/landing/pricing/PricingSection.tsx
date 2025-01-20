import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started",
    features: [
      "1 Organization",
      "Up to 5 members",
      "Basic post scheduling",
      "Standard analytics",
      "Community support",
      "Basic integrations",
      "1GB storage per org",
      "7-day post history"
    ],
    action: "Get Started",
    popular: false,
    priceId: process.env.NEXT_PUBLIC_STRIPE_FREE_PRICE_ID
  },
  {
    name: "Pro",
    price: "$14",
    period: "/month",
    description: "Best for growing organizations",
    features: [
      "Unlimited organizations",
      "Unlimited members",
      "Advanced post scheduling",
      "Advanced analytics & insights",
      "Priority support",
      "Premium integrations",
      "100GB storage per org",
      "Unlimited post history",
      "Custom branding",
      "API access",
      "Audit logs",
      "SSO & SAML",
      "Advanced security features"
    ],
    action: "Upgrade Now",
    popular: true,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID
  },
  {
    name: "Pro Lifetime",
    price: "$199",
    description: "One-time payment for lifetime access",
    features: [
      "All Pro features",
      "Lifetime access",
      "Early access to new features",
      "Direct support line",
      "Custom feature requests",
      "250GB storage per org",
      "Priority API rate limits",
      "Enterprise integrations"
    ],
    action: "Get Lifetime Access",
    popular: false,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_LIFETIME_PRICE_ID
  }
];

export function PricingSection() {
  const router = useRouter();

  const handleUpgrade = async (priceId: string | undefined) => {
    if (!priceId) return;
    
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          successUrl: window.location.origin + "/account/billing?success=true",
          cancelUrl: window.location.origin + "/pricing?canceled=true",
        }),
      });

      const data = await response.json();

      if (data.url) {
        router.push(data.url);
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    }
  };

  return (
    <section className="container mx-auto py-24" id="pricing">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Simple, transparent pricing
        </h2>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Choose the plan that best fits your needs. All plans include a 14-day money-back guarantee.
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative flex flex-col p-8 ${
              plan.popular ? "border-primary shadow-lg" : ""
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-medium text-primary-foreground">
                Most Popular
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && (
                  <span className="text-muted-foreground">{plan.period}</span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {plan.description}
              </p>
            </div>

            <ul className="mb-8 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => handleUpgrade(plan.priceId)}
              className={`mt-auto ${
                plan.popular ? "bg-primary hover:bg-primary/90" : ""
              }`}
              variant={plan.popular ? "default" : "outline"}
            >
              {plan.action}
            </Button>
          </Card>
        ))}
      </div>
    </section>
  );
}
