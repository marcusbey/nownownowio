'use client';

import { Typography } from "@/components/ui/typography";
import { SectionLayout } from "../landing/SectionLayout";
import { PricingCard } from "./PricingCard";
import { Plan, PLANS } from "./plans";
import { getStripePrices } from "@/lib/stripe";
import { config } from "@/lib/config";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function PricingSection() {
  const [plans, setPlans] = useState<Plan[]>(PLANS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setIsLoading(true);
        const stripePrices = await getStripePrices();
        
        const updatedPlans = PLANS.map((plan) => {
          if (plan.type === "recurring") {
            const monthlyPrice = stripePrices.find(
              price => price.id === config.stripe.priceIds.proMonthly
            );
            const yearlyPrice = stripePrices.find(
              price => price.id === config.stripe.priceIds.proYearly
            );

            if (!monthlyPrice?.unit_amount || !yearlyPrice?.unit_amount) {
              console.error('Missing price data for plan:', plan.id);
              return plan;
            }

            return {
              ...plan,
              price: monthlyPrice.unit_amount / 100,
              yearlyPrice: yearlyPrice.unit_amount / 100,
              priceId: monthlyPrice.id,
              yearlyPriceId: yearlyPrice.id,
              currency: monthlyPrice.currency.toUpperCase(),
            };
          } else {
            const lifetimePrice = stripePrices.find(
              price => price.id === config.stripe.priceIds.proLifetime
            );

            if (!lifetimePrice?.unit_amount) {
              console.error('Missing price data for plan:', plan.id);
              return plan;
            }

            return {
              ...plan,
              price: lifetimePrice.unit_amount / 100,
              priceId: lifetimePrice.id,
              currency: lifetimePrice.currency.toUpperCase(),
            };
          }
        });

        setPlans(updatedPlans);
      } catch (error) {
        console.error('Error fetching prices:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrices();
  }, []);

  if (isLoading) {
    return (
      <SectionLayout
        size="base"
        id="pricing"
        className="flex w-full flex-col items-center gap-16"
      >
        <div className="space-y-2 text-center">
          <Typography
            variant="small"
            className="font-extrabold uppercase text-primary"
          >
            Pricing
          </Typography>
          <Typography variant="h2">
            Choose the best plan for your business
          </Typography>
        </div>

        <div className="flex w-full justify-center gap-4 max-md:flex-col lg:gap-8 xl:gap-12">
          {PLANS.map((card) => (
            <div key={card.id} className="w-full max-w-sm">
              <Skeleton className="h-[600px] w-full rounded-xl" />
            </div>
          ))}
        </div>
      </SectionLayout>
    );
  }

  return (
    <SectionLayout
      size="base"
      id="pricing"
      className="flex w-full flex-col items-center gap-16"
    >
      <div className="space-y-2 text-center">
        <Typography
          variant="small"
          className="font-extrabold uppercase text-primary"
        >
          Pricing
        </Typography>
        <Typography variant="h2">
          Choose the best plan for your business
        </Typography>
      </div>

      <div className="flex w-full justify-center gap-4 max-md:flex-col lg:gap-8 xl:gap-12">
        {plans.map((card) => (
          <PricingCard
            key={card.id}
            {...card}
          />
        ))}
      </div>
    </SectionLayout>
  );
}
