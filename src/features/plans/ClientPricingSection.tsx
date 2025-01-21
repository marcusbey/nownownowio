'use client';

import { Typography } from "@/components/ui/typography";
import { PricingCard } from "./PricingCard";
import { PLANS } from "./plans";
import { cn } from "@/lib/utils";

interface ClientPricingSectionProps {
  variant?: "default" | "compact";
}

export function ClientPricingSection({ variant = "default" }: ClientPricingSectionProps) {
  return (
    <div>
      {variant === "default" && (
        <div className="mx-auto max-w-4xl text-center">
          <Typography variant="h2" className="mb-4">
            Simple, transparent pricing
          </Typography>
          <Typography variant="large" className="text-muted-foreground">
            Choose the perfect plan for your needs
          </Typography>
        </div>
      )}

      <div 
        className={cn(
          "mx-auto mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2",
          variant === "default" ? "max-w-5xl" : "max-w-3xl"
        )}
      >
        {PLANS.map((plan) => (
          <PricingCard 
            key={plan.id} 
            plan={plan} 
            variant={variant}
          />
        ))}
      </div>
    </div>
  );
}
