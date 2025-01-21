"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Typography } from "@/components/ui/typography";
import { BuyButton } from "@/features/stripe/BuyButton";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useParams } from "next/navigation";
import { Plan } from "./plans";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export const PricingCard = (props: Plan) => {
  const params = useParams();
  const [isYearly, setIsYearly] = useState(false);
  const organizationSlug = params.orgSlug ? params.orgSlug : "";

  const currentPrice = isYearly ? props.yearlyPrice || props.price : props.price;
  const currentPriceId = isYearly ? props.yearlyPriceId || props.priceId : props.priceId;
  const monthlyPrice = props.price;
  const yearlyPrice = props.yearlyPrice;
  const yearlyMonthlyPrice = yearlyPrice ? yearlyPrice / 12 : null;
  const savings = yearlyMonthlyPrice ? Math.round((1 - yearlyMonthlyPrice / monthlyPrice) * 100) : 0;

  return (
    <Card
      className={cn(
        "border-[0.5px] h-fit lg:rounded-3xl rounded-3xl flex-1 p-6 ring-1 ring-gray-900/10 sm:p-8",
        {
          "relative bg-background shadow-2xl": props.isPopular,
          "bg-background/60 sm:mx-8 lg:mx-0": !props.isPopular,
        },
        props.className,
      )}
    >
      {props.isPopular ? (
        <div className="absolute inset-x-0 top-0 flex items-center justify-center">
          <Badge className="-translate-y-1/2">Popular</Badge>
        </div>
      ) : null}
      
      <div className="flex flex-col gap-8">
        {/* Header Section */}
        <div className="space-y-2">
          <p className="text-lg font-bold uppercase text-primary">
            {props.name}
          </p>
          <Typography variant="muted">{props.subtitle}</Typography>
        </div>

        {/* Pricing Section - Fixed Height */}
        <div className="space-y-6">
          {/* Toggle or Info Box */}
          {props.type === "recurring" ? (
            <div className="flex items-center justify-between gap-2 bg-muted/30 rounded-lg p-2">
              <div className="flex items-center gap-2">
                <Label className={cn("text-sm", !isYearly && "text-primary font-medium")}>Monthly</Label>
                <Switch
                  checked={isYearly}
                  onCheckedChange={setIsYearly}
                  className="data-[state=checked]:bg-primary"
                />
                <Label className={cn("text-sm", isYearly && "text-primary font-medium")}>Yearly</Label>
              </div>
              {yearlyMonthlyPrice && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground line-through">${monthlyPrice}/mo</span>
                  <div className="flex items-center gap-1">
                    <span className="text-primary font-medium">${yearlyMonthlyPrice.toFixed(2)}/mo</span>
                    {isYearly && savings > 0 && (
                      <Badge variant="secondary" className="bg-green-500/10 text-green-600 text-xs whitespace-nowrap">
                        Save {savings}%
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 bg-muted/30 rounded-lg p-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 text-xs whitespace-nowrap">
                  Best value
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                One-time payment
              </div>
            </div>
          )}

          {/* Price Display */}
          <div className="h-24 flex items-center justify-center">
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-3xl font-medium">$</span>
              <span className="text-6xl font-extrabold tracking-tight">
                {typeof currentPrice === 'number' ? currentPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '--'}
              </span>
              <span className="text-lg text-muted-foreground">
                {props.currency ?? "USD"}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Features List */}
        <ul className="flex flex-col gap-3">
          {props.features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2">
              <Check className="text-green-500 flex-shrink-0" size={18} />
              <Typography variant="muted" className="flex-1">
                {feature}
              </Typography>
            </li>
          ))}
        </ul>

        {/* Footer */}
        <div className="flex flex-col gap-3">
          <BuyButton
            organizationSlug={organizationSlug}
            priceId={currentPriceId}
            className="w-full"
          >
            Get Started
          </BuyButton>
          <Typography variant="small" className="text-center text-muted-foreground">
            {props.type === "recurring" ? (isYearly ? "Billed yearly" : "Billed monthly") : props.ctaSubtitle}
          </Typography>
        </div>
      </div>
    </Card>
  );
};
