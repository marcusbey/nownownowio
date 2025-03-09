import { buttonVariants } from "@/components/core/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/data-display/card";
import { Badge } from "@/components/data-display/badge";
import { BadgeCheck, Sparkles, Clock } from "lucide-react";
import Link from "next/link";
import { useCurrentOrg } from "../../use-current-org";
import { useEffect, useState } from "react";
import { addDays } from "date-fns";
import { useSession } from "next-auth/react";

export const UpgradeCard = () => {
  const org = useCurrentOrg();
  const { data: session } = useSession();
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  const [isTrialActive, setIsTrialActive] = useState(false);

  useEffect(() => {
    if (!org) return;
    
    // Log the organization object for debugging
    // eslint-disable-next-line no-console
    console.log('Organization object:', org);
    
    // Log the user session for debugging
    // eslint-disable-next-line no-console
    console.log('User session:', session);
    
    // For demo purposes, we'll simulate a trial period based on the current date
    // In a real app, you would fetch this from the OrganizationPlanHistory table
    const today = new Date();
    const trialEndDate = addDays(today, 7); // Simulate 7-day trial from today
    
    // Calculate days remaining in trial
    const daysRemaining = Math.ceil((trialEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    setTrialDaysLeft(daysRemaining);
    setIsTrialActive(daysRemaining > 0);
  }, [org, session]);

  // Only show card for organizations on the free plan or in trial period
  if (!org) return null;
  
  // For demo, always show the trial card
  // In production, you would check: if (org.plan.id !== "FREE" && !isTrialActive) return null;

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-accent/40 shadow-sm">
      <div className="absolute right-0 top-0 size-16 translate-x-6 translate-y-1 opacity-20">
        <Sparkles className="size-full text-primary" />
      </div>
      
      {isTrialActive && trialDaysLeft !== null && (
        <div className="absolute right-2 top-2">
          <Badge 
            variant="outline" 
            className="flex items-center gap-1 border-primary/20 bg-primary/10 text-primary"
          >
            <Clock className="size-3" />
            <span>{trialDaysLeft} {trialDaysLeft === 1 ? 'day' : 'days'} left</span>
          </Badge>
        </div>
      )}
      
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center space-x-2">
          <BadgeCheck className="size-5 text-primary" />
          <CardTitle className="text-lg">
            {isTrialActive ? 'Trial Active' : 'Upgrade to PRO'}
          </CardTitle>
        </div>
        <CardDescription className="mt-2 text-sm">
          {isTrialActive 
            ? `Your ${org.plan.type === 'FREE' ? 'pro' : org.plan.type.toLowerCase()} plan trial ends in ${trialDaysLeft} ${trialDaysLeft === 1 ? 'day' : 'days'}.` 
            : 'Unlock premium features and get unlimited access.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Link
          href={`/orgs/${org.slug}/settings/billing`}
          className={buttonVariants({
            variant: "default",
            size: "sm",
            className:
              "mt-2 w-full font-medium shadow-sm transition-all hover:shadow-md",
          })}
        >
          {isTrialActive ? 'Continue with PRO' : 'Upgrade Now'}
        </Link>
      </CardContent>
    </Card>
  );
};
