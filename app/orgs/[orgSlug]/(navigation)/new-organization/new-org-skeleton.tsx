import { Card, CardContent, CardFooter } from "@/components/data-display/card";
import { Skeleton } from "@/components/feedback/skeleton";

// Export the skeleton component for loading state
export default function NewOrgSkeleton() {
  return (
    <div className="flex w-full flex-col gap-6 lg:gap-8">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-2 h-4 w-48" />
        </div>
      </div>
      
      <Card className="overflow-hidden bg-card">
        <CardContent className="mt-6 flex flex-col gap-4 lg:gap-6">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
          
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
          
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t border-border bg-background pt-6">
          <Skeleton className="h-10 w-48" />
        </CardFooter>
      </Card>
    </div>
  );
}
