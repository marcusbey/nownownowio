import { Skeleton } from "@/components/feedback/skeleton";

export default function BillingLoading() {
  return (
    <div className="container max-w-4xl py-6">
      <div className="mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72 mt-2" />
      </div>
      
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-xs" />
        
        <div className="rounded-lg border p-6">
          <Skeleton className="h-6 w-64 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-6" />
          <Skeleton className="h-10 w-36" />
        </div>
      </div>
    </div>
  );
}
