import { Card, CardContent, CardHeader, CardTitle } from "@/components/data-display/card";
import { Skeleton } from "@/components/feedback/skeleton";

export default function PageLoading() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit your profile</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-20" />
      </CardContent>
    </Card>
  );
}
