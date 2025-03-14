import { buttonVariants } from "@/components/core/button";
import { TooltipProvider } from "@/components/data-display/tooltip";
import { Header } from "@/features/layout/header";
import {
  Layout,
  LayoutContent,
  LayoutDescription,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import type { PageParams } from "@/types/next";
import Link from "next/link";
import { redirect } from "next/navigation";

/**
 * This page is show when a user loggin. You can add an onboarding process here.
 */
export default async function NewUserPage(props: PageParams) {
  // In Next.js 15, searchParams is a Promise that needs to be awaited
  const searchParams = await props.searchParams;
  const callbackUrl = typeof searchParams.callbackUrl === "string"
    ? searchParams.callbackUrl
    : "/";

  redirect(callbackUrl);

  return (
    <>
      <TooltipProvider>
        <Header />
      </TooltipProvider>
      <Layout>
        <LayoutHeader>
          <LayoutTitle>Successfully login</LayoutTitle>
          <LayoutDescription>You can now use the app</LayoutDescription>
        </LayoutHeader>
        <LayoutContent>
          <Link href="/" className={buttonVariants({ size: "lg" })}>
            Get Started
          </Link>
        </LayoutContent>
      </Layout>
    </>
  );
}
