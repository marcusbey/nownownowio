/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { buttonVariants } from "@/components/core/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/data-display/card";
import { Badge } from "@/components/data-display/badge";
import { BadgeCheck, Sparkles, Clock, XCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useCurrentOrg } from "../../use-current-org";
import { useEffect, useState } from "react";
import { addDays, differenceInDays, format, isAfter } from "date-fns";

// Define types for organization and plan data
type Plan = {
  id: string;
  type: string;
  createdAt: string | Date;
};

type Organization = {
  id: string;
  slug: string;
  plan: Plan | null;
  planChangedAt: string | null;
};

type TrialStatus = 'active' | 'expired' | 'paid' | 'free';

type TrialInfo = {
  daysLeft: number;
  expiryDate: Date | null;
  status: TrialStatus;
};

/**
 * UpgradeCard component displays organization plan information and upgrade options
 * Shows different UI states based on trial status: active, expired, paid, or free
 */
export const UpgradeCard = () => {
  // Get organization data
  const orgData = useCurrentOrg();
  
  
  // Use as unknown first to avoid type compatibility issues
  const org = orgData as unknown as Organization;
  
  const [trialInfo, setTrialInfo] = useState<TrialInfo>({ 
    daysLeft: 0, 
    expiryDate: null,
    status: 'free'
  });
  


  // Add a state to track if the plan is paid based on additional checks
  const [isPaidPlan, setIsPaidPlan] = useState(false);

  useEffect(() => {
    // Skip if no org data is available
    if (!org?.plan?.createdAt) {

      return;
    }
    
    // Use plan creation date as trial start date
    const trialStartDate = new Date(org.plan.createdAt);
    const trialEndDate = addDays(trialStartDate, 7); // 7-day trial
    const now = new Date();
    const daysLeft = Math.max(0, differenceInDays(trialEndDate, now));
    
    // Check if this is a paid plan based on multiple indicators
    const hasPaidPlanType = org?.plan?.type === 'BASIC' || org?.plan?.type === 'PRO';
    const hasPlanChangedAt = Boolean(org?.planChangedAt);
    
    // Set the paid plan state for use in other parts of the component
    setIsPaidPlan(hasPaidPlanType);
    
    // Determine plan status
    let status: TrialStatus = 'free';
    
    if (hasPaidPlanType) {
      if (hasPlanChangedAt) {
        // If planChangedAt exists, this is a confirmed paid plan
        status = 'paid';
      } else if (daysLeft > 0) {
        // If we're in the trial period (days left > 0)
        status = 'active';
      } else {
        // Trial has ended
        status = 'expired';
      }
    }
    
    setTrialInfo({
      daysLeft,
      expiryDate: trialEndDate,
      status
    });
  }, [org]);

  // Only render if organization data is available
  if (!org || !org.id) return null;
  
  return (
    <>
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-accent/40 shadow-sm">
        <div className="absolute right-0 top-0 size-16 translate-x-6 translate-y-1 opacity-20">
          <Sparkles className="size-full text-primary" />
        </div>
        
        {/* Status badge - Only show here for expired and free plans */}
        <div className="absolute right-2 top-2">
          {trialInfo.status === 'expired' && (
            <Badge 
              variant="outline" 
              className="flex items-center gap-1 border-amber-200 bg-amber-100 text-amber-800"
            >
              <XCircle className="size-3" />
              <span>Trial Expired</span>
            </Badge>
          )}
          
          {trialInfo.status === 'free' && (
            <Badge 
              variant="outline" 
              className="flex items-center gap-1 border-slate-200 bg-slate-100 text-slate-800"
            >
              <CheckCircle2 className="size-3" />
              <span>Free Plan</span>
            </Badge>
          )}
        
        {/* Badges for paid and active trial plans are shown inline with the title */}
      </div>
      
      <CardHeader className="p-4 pb-2">
        {/* SCENARIO 1: Trial is active */}
        {trialInfo.status === 'active' && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="size-5 text-green-600" />
                <CardTitle className="text-lg">Trial Active</CardTitle>
              </div>
              <Badge 
                variant="outline" 
                className="flex items-center gap-1 border-green-200 bg-green-100 text-green-800"
              >
                <Clock className="size-3" />
                <span>{trialInfo.daysLeft} {trialInfo.daysLeft === 1 ? 'day' : 'days'} left</span>
              </Badge>
            </div>
            <CardDescription className="mt-2 text-sm">
              Your basic plan trial ends on {trialInfo.expiryDate ? format(trialInfo.expiryDate, 'MMMM d, yyyy') : ''}. Enjoy premium features during your trial period!
            </CardDescription>
          </>
        )}
        
        {/* SCENARIO 2: Trial has expired */}
        {trialInfo.status === 'expired' && (
          <>
            <div className="flex items-center space-x-2">
              <XCircle className="size-5 text-amber-600" />
              <CardTitle className="text-lg">Trial Expired</CardTitle>
            </div>
            <CardDescription className="mt-2 text-sm">
              Your trial period has ended. Upgrade now to restore access to premium features and continue with your work.
            </CardDescription>
          </>
        )}
        
        {/* SCENARIO 3: Paid plan */}
        {trialInfo.status === 'paid' && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="size-5 text-blue-600" />
                <CardTitle className="text-lg">Active Plan</CardTitle>
              </div>
              <Badge 
                variant="outline" 
                className="flex items-center gap-1 border-blue-200 bg-blue-100 text-blue-800"
              >
                <span>PRO</span>
              </Badge>
            </div>
            <CardDescription className="mt-2 text-sm">
              You're enjoying all premium features with your PRO subscription. Thank you for your support!
            </CardDescription>
          </>
        )}
        
        {/* SCENARIO 4: Free plan */}
        {trialInfo.status === 'free' && (
          <>
            <div className="flex items-center space-x-2">
              <BadgeCheck className="size-5 text-primary" />
              <CardTitle className="text-lg">Upgrade to PRO</CardTitle>
            </div>
            <CardDescription className="mt-2 text-sm">
              Unlock premium features and get unlimited access. Start with a 7-day free trial, no credit card required.
            </CardDescription>
          </>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {trialInfo.status !== 'paid' && (
          <Link
            href={`/orgs/${org?.slug || ''}/settings/subscription`}
            className={buttonVariants({
              variant: trialInfo.status === 'expired' ? "destructive" : "default",
              size: "sm",
              className:
                "mt-2 w-full font-medium shadow-sm transition-all hover:shadow-md",
            })}
          >
            {trialInfo.status === 'active' ? 'Continue with PRO' : 
             trialInfo.status === 'expired' ? 'Restore Access' : 
             'Start Free Trial'}
          </Link>
        )}
        {trialInfo.status === 'paid' && (
          <Link
            href={`/orgs/${org?.slug || ''}/settings/plan`}
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className:
                "mt-2 w-full font-medium shadow-sm transition-all hover:shadow-md",
            })}
          >
            Manage Subscription
          </Link>
        )}
      </CardContent>
    </Card>
    </>
  );
};
