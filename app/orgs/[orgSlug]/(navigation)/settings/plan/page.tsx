import { Suspense } from "react";
import { Skeleton } from "@/components/feedback/skeleton";
import type { PageParams } from "@/types/next";
import { PlanContent } from "./plan-content";
import { combineWithParentMetadata } from "@/lib/metadata";

export const generateMetadata = combineWithParentMetadata({
  title: "Plan Settings",
  description: "Manage your organization's plan settings",
});

export default async function PlanPage({ params }: PageParams<{ orgSlug: string }>) {
  const { orgSlug } = params;
  
  return (
    <Suspense fallback={<PlanSkeleton />}>
      <PlanContent orgSlug={orgSlug} />
    </Suspense>
  );
}

function PlanSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-6 w-[250px]" />
        <Skeleton className="mt-2 h-4 w-[350px]" />
      </div>
      <div className="rounded-md border p-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-[150px]" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-[150px]" />
            <div className="space-y-2 pl-5">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[180px]" />
              <Skeleton className="h-4 w-[220px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
