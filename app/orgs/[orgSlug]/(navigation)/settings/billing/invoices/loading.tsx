import { Skeleton } from "@/components/feedback/skeleton";

export default function InvoicesLoading() {
  return (
    <div className="container max-w-4xl py-6">
      <div className="mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>
      
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-xs" />
        
        <div className="rounded-lg border p-6">
          <Skeleton className="mb-4 h-6 w-64" />
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="mb-6 h-4 w-3/4" />
          
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <Skeleton className="mb-1 h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-9 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
