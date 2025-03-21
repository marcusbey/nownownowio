import { buttonVariants } from "@/components/core/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/data-display/card";
import { HeaderBase } from "@/features/layout/header-base";
import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import type { PageParams } from "@/types/next";
import Link from "next/link";
import { getError } from "./auth-error-mapping";

export default async function AuthErrorPage(props: PageParams) {
  // In Next.js 15, searchParams is a Promise that needs to be awaited
  const searchParams = await props.searchParams;
  const { errorMessage, error } = getError(searchParams.error);

  return (
    <div className="flex h-full flex-col">
      <HeaderBase />
      <Layout>
        <LayoutHeader>
          <LayoutTitle>Authentification Error</LayoutTitle>
        </LayoutHeader>
        <LayoutContent>
          <Card variant="error">
            <CardHeader>
              <CardDescription>{error}</CardDescription>
              <CardTitle>{errorMessage}</CardTitle>
            </CardHeader>
            <CardFooter className="flex items-center gap-2">
              <Link href="/" className={buttonVariants({ size: "sm" })}>
                Home
              </Link>
            </CardFooter>
          </Card>
        </LayoutContent>
      </Layout>
    </div>
  );
}
