import { combineWithParentMetadata } from "@/lib/metadata";
import { redirect } from "next/navigation";
import type { PageParams } from "@/types/next";

export const generateMetadata = combineWithParentMetadata({
  title: "Account Settings",
  description: "Manage your account settings.",
});

export default async function AccountPage({ params }: PageParams<{ orgSlug: string }>) {
  // In Next.js 15, params is a Promise that needs to be properly awaited
  const resolvedParams = await params;
  const { orgSlug } = resolvedParams;
  
  // Redirect to the main settings page which now contains personal account settings
  redirect(`/orgs/${orgSlug}/settings`);
}
