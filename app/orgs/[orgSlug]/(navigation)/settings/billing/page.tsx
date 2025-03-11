import { Suspense } from "react";
import { combineWithParentMetadata } from "@/lib/metadata";
import type { PageParams } from "@/types/next";
import { BillingContent } from "./billing-content";
import { Skeleton } from "@/components/feedback/skeleton";

export const generateMetadata = combineWithParentMetadata({
  title: "Billing",
  description: "Manage your payment methods and billing information.",
});

export default async function BillingPage({ params }: PageParams<{ orgSlug: string }>) {
  // In Next.js 15, we need to await the params object
  const awaitedParams = await params;
  const orgSlug = awaitedParams.orgSlug;
  return (
    <Suspense fallback={<BillingSkeleton />}>
      <BillingContent orgSlug={orgSlug} />
    </Suspense>
  );
}

function BillingSkeleton() {
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
            <Skeleton className="h-4 w-[200px]" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-[150px]" />
            <Skeleton className="h-4 w-[250px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
