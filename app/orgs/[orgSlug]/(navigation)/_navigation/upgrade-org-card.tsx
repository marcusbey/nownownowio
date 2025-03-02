import { buttonVariants } from "@/components/core/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/data-display/card";
import { BadgeCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useCurrentOrg } from "../../use-current-org";

export const UpgradeCard = () => {
  const org = useCurrentOrg();

  // Only show card for organizations on the free plan
  if (!org || org.plan.id !== "FREE") {
    return null;
  }

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-accent/40 shadow-sm">
      <div className="absolute right-0 top-0 size-16 translate-x-6 translate-y-1 opacity-20">
        <Sparkles className="size-full text-primary" />
      </div>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center space-x-2">
          <BadgeCheck className="size-5 text-primary" />
          <CardTitle className="text-lg">Upgrade to PRO</CardTitle>
        </div>
        <CardDescription className="mt-2 text-sm">
          Unlock premium features and get unlimited access.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Link
          href={`/orgs/${org.slug}/settings/billing`}
          className={buttonVariants({
            variant: "default",
            size: "sm",
            className:
              "mt-2 w-full font-medium shadow-sm transition-all hover:shadow-md",
          })}
        >
          Upgrade Now
        </Link>
      </CardContent>
    </Card>
  );
};
