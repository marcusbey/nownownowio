'use client';

import { Typography } from "@/components/ui/typography";
import { SectionLayout } from "../landing/SectionLayout";
import { PricingCard } from "./PricingCard";
import { Plan, PLANS } from "./plans";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface PricingSectionProps {
  variant?: "default" | "compact";
}

export function PricingSection({ variant = "default" }: PricingSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePlanSelect = (planId: string) => {
    router.push(`/sign-up?plan=${planId}`);
  };

  return (
    <SectionLayout id="pricing">
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
          "mx-auto mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2",
          variant === "default" ? "max-w-5xl" : "max-w-3xl"
        )}
      >
        {isLoading ? (
          <>
            <Skeleton className={cn(
              "w-full",
              variant === "default" ? "h-[600px]" : "h-[400px]"
            )} />
            <Skeleton className={cn(
              "w-full",
              variant === "default" ? "h-[600px]" : "h-[400px]"
            )} />
          </>
        ) : (
          PLANS.map((plan) => (
            <PricingCard 
              key={plan.id} 
              plan={plan} 
              variant={variant}
              onSelect={handlePlanSelect}
            />
          ))
        )}
      </div>
    </SectionLayout>
  );
}
