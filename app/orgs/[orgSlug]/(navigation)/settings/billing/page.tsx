import { combineWithParentMetadata } from "@/lib/metadata";
import type { PageParams } from "@/types/next";
import { PlanContent } from "./plan-content";

export const generateMetadata = combineWithParentMetadata({
  title: "Plan & Billing",
  description: "Manage your subscription plan and billing information.",
});

export default function BillingPage({ params }: PageParams<{ orgSlug: string }>) {
  return <PlanContent orgSlug={params.orgSlug} />;
}
