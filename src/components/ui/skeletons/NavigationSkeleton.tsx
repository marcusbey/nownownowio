import { Skeleton } from "@/components/ui/skeleton";

export function NavigationSkeleton() {
  return (
    <div className="flex h-screen w-full flex-col gap-4 p-4">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Navigation Links Skeleton */}
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>

      {/* Bottom Section Skeleton */}
      <div className="mt-auto flex flex-col gap-4">
        <Skeleton className="h-32 w-full rounded-lg" />
        <div className="flex items-center gap-2">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}
