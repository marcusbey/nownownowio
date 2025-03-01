import { redirect } from "next/navigation";
import type { PageParams } from "@/types/next";

export default function InvoicesPage({ params }: PageParams<{ orgSlug: string }>) {
  redirect(`/orgs/${params.orgSlug}/settings/billing`);
}
