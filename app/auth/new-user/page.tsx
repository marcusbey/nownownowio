import { buttonVariants } from "@/components/core/button";
import { Header } from "@/features/core/header";
import {
  Layout,
  LayoutContent,
  LayoutDescription,
  LayoutHeader,
  LayoutTitle,
} from "@/features/core/layout";
import type { PageParams } from "@/types/next";
import Link from "next/link";
import { redirect } from "next/navigation";

/**
 * This page is show when a user loggin. You can add an onboarding process here.
 */
export default async function NewUserPage(props: PageParams) {
  const searchParams = await props.searchParams;
  const callbackUrl =
    typeof searchParams.callbackUrl === "string"
      ? searchParams.callbackUrl
      : "/";

  redirect(callbackUrl);

  return (
    <>
      <Header />
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
