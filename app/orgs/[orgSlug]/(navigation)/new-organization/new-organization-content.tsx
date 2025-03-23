"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/data-display/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/feedback/alert";
import { useOrganization } from "@/query/org/org.query";
import { NewOrganizationForm } from "../../../new/new-org-form";
import { Button } from "@/components/core/button";
import { ArrowRight, Lock, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

// Using string literals for plan types to match the API response

type NewOrganizationContentProps = {
  orgSlug: string;
};

// Export the main component for creating new organizations
export default function NewOrganizationContent({ orgSlug }: NewOrganizationContentProps) {
  const { organization, isLoading } = useOrganization(orgSlug);
  
  // Determine if the user can create a new organization based on their plan
  const canCreateOrganization = useMemo(() => {
    if (!organization || isLoading) return false;
    if (!organization.plan) return false;
    
    // Only PREMIUM or ENTERPRISE plans can create additional organizations
    return organization.plan.type === 'PREMIUM' || organization.plan.type === 'ENTERPRISE';
  }, [organization, isLoading]);
  
  // Get the current plan name for display
  const currentPlanName = useMemo(() => {
    if (!organization || isLoading) return "Free";
    
    // Default to FREE if no plan is set
    const planType = organization.plan?.type ?? 'FREE';
    
    // Return formatted plan name
    switch (planType) {
      case 'FREE':
        return "Free";
      case 'PREMIUM':
        return "Premium";
      case 'ENTERPRISE':
        return "Enterprise";
      default:
        return "Free";
    }
  }, [organization, isLoading]);
  
  if (isLoading) {
    return <div className="animate-pulse">Loading organization details...</div>;
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create New Organization</h1>
        <p className="text-muted-foreground mt-2">
          Create a new organization to manage separate projects or teams
        </p>
      </div>
      
      {!canCreateOrganization ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-amber-500" />
              Plan Upgrade Required
            </CardTitle>
            <CardDescription>
              Your current plan ({currentPlanName}) doesn't support creating multiple organizations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Plan Limitation</AlertTitle>
              <AlertDescription>
                Only Pro plans and above can create multiple organizations. Upgrade your plan to create additional organizations.
              </AlertDescription>
            </Alert>
            
            <div className="rounded-lg border p-4 bg-muted/50">
              <h3 className="font-medium mb-2">Pro Plan Benefits:</h3>
              <ul className="space-y-2 ml-6 list-disc">
                <li>Create up to 5 organizations</li>
                <li>5 widgets (1 per organization)</li>
                <li>Up to 5 team members</li>
                <li>Advanced feedback collection</li>
                <li>User chat functionality</li>
                <li>Advanced analytics dashboard</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-6">
            <Link href={`/orgs/${orgSlug}/settings/plan`}>
              <Button className="flex items-center gap-2">
                Upgrade Plan
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ) : (
        <NewOrganizationForm />
      )}
    </div>
  );
}
