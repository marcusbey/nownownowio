import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";
import { ArrowUpCircle } from "lucide-react";
import Link from "next/link";

export const UpgradeCard = async () => {
  const { org: organization } = await getRequiredCurrentOrgCache();

  if (organization.plan.id !== "FREE") return null;

  return (
    <>
      <Card className="hidden md:block">
        <CardHeader className="p-2 pt-0 md:p-4">
          <CardTitle>Upgrade to PRO</CardTitle>
          <CardDescription>
            Unlock all features and get unlimited access to our app.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
          <Link
            href={`/orgs/${organization.slug}/settings/billing`}
            className={buttonVariants({ className: "w-full" })}
          >
            Upgrade
          </Link>
        </CardContent>
      </Card>
      <Card className="hidden sm:block sm:border-none sm:bg-transparent md:hidden">
        <CardContent className="p-2">
          <Link
            href={`/orgs/${organization.slug}/settings/billing`}
            className={buttonVariants({ className: "w-full" })}
          >
            Upgrade
          </Link>
        </CardContent>
      </Card>
      <Link
        href={`/orgs/${organization.slug}/settings/billing`}
        className={buttonVariants({
          variant: "secondary",
          className: "sm:hidden aspect-square p-2",
        })}
      >
        <ArrowUpCircle size={24} />
      </Link>
    </>
  );
};
