'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter, useParams } from "next/navigation";
import { useOrganization } from "@/query/org/org.query";
import { Skeleton } from "@/components/ui/skeleton";

export function UpgradeCard() {
  const router = useRouter();
  const params = useParams();
  const orgSlug = params.orgSlug as string;
  const { organization, isLoading } = useOrganization(orgSlug);

  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!organization) return null;

  // Check if plan exists and is not FREE
  if (!organization.plan || organization.plan.id !== "FREE") return null;

  const handleClick = () => router.push(`/orgs/${orgSlug}/settings/billing`);

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Upgrade to Free Bird</CardTitle>
        <CardDescription>
          Get lifetime access to all features with our Free Bird plan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleClick}
          variant="default"
          size="default"
          className="w-full"
        >
          Join Community
        </Button>
      </CardContent>
    </Card>
  );
}
