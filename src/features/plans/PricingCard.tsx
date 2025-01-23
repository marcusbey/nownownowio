'use client';

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
import { Plan } from "./plans";
import { useRouter, useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface PricingCardProps {
  plan: Plan;
  variant?: "default" | "compact";
  onSelect: (planId: string) => void;
}

export function PricingCard({ plan, variant = "default", onSelect }: PricingCardProps) {
  const router = useRouter();
  const params = useParams();
  const [isYearly, setIsYearly] = useState(false);

  const handleClick = () => {
    if (!params.orgSlug) {
      router.push('/sign-up');
      return;
    }
    router.push(`/orgs/${params.orgSlug}/settings/billing`);
  };

  const isFreeBird = plan.id.startsWith('FREEBIRD');
  const currentPrice = isYearly ? plan.yearlyPrice || plan.price : plan.price;
  const currentPriceId = isYearly ? plan.yearlyPriceId || plan.priceId : plan.priceId;

  return (
    <Card 
      className={cn(
        "flex flex-col",
        isFreeBird && "border-primary",
        variant === "default" ? "p-6" : "p-4"
      )}
    >
      <CardHeader className="p-0">
        <CardTitle className={cn(
          variant === "default" ? "text-2xl" : "text-xl"
        )}>
          {plan.name}
        </CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-0 pt-6">
        <div className="h-[72px]"> {/* Fixed height for price toggle section */}
          {plan.type === "recurring" ? (
            <div className="mb-4 flex items-center justify-between gap-2 rounded-lg bg-muted/30 p-2">
              <div className="flex items-center gap-2">
                <Label className={cn("text-sm", !isYearly && "text-primary font-medium")}>Monthly</Label>
                <Switch
                  checked={isYearly}
                  onCheckedChange={setIsYearly}
                  className="data-[state=checked]:bg-primary"
                />
                <Label className={cn("text-sm", isYearly && "text-primary font-medium")}>Yearly</Label>
              </div>
              {isYearly && (
                <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                  Save 23%
                </Badge>
              )}
            </div>
          ) : (
            <div className="mb-4 flex items-center justify-between gap-2 rounded-lg bg-muted/30 p-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm text-muted-foreground">One-time payment</Label>
              </div>
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
                Best Value
              </Badge>
            </div>
          )}
        </div>
        <div className="mb-6">
          <Typography variant="h3" className={cn(
            "mb-2",
            variant === "default" ? "text-5xl" : "text-3xl"
          )}>
            ${currentPrice}
            <Typography variant="small" className="text-muted-foreground">
              {plan.type === "recurring" ? (
                isYearly ? " /year" : " /month"
              ) : (
                " one-time"
              )}
            </Typography>
          </Typography>
        </div>
        <ul className={cn(
          "space-y-2",
          variant === "default" ? "text-base" : "text-sm"
        )}>
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="p-0 pt-6">
        <Button
          className="w-full"
          size="lg"
          onClick={() => onSelect(plan.id)}
        >
          Join Community
        </Button>
      </CardFooter>
    </Card>
  );
}
