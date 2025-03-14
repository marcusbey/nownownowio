import { buttonVariants } from "@/components/core/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/data-display/card";
import { createSearchParamsMessageUrl } from "@/features/ui/searchparams-message/createSearchParamsMessageUrl";
import { combineWithParentMetadata } from "@/lib/metadata";
import { prisma } from "@/lib/prisma";
import type { PageParams } from "@/types/next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const generateMetadata = combineWithParentMetadata({
  title: "Verify email",
  description: "Verify your email address.",
});

export default async function RoutePage(props: PageParams) {
  const searchParams = await props.searchParams;
  const token =
    typeof searchParams.token === "string" ? searchParams.token : null;

  if (!token) {
    return (
      <Card variant="error">
        <CardHeader>
          <CardTitle>Invalid Token</CardTitle>
        </CardHeader>
        <CardFooter>
          <Link className={buttonVariants()} href="/account">
            Account
          </Link>
        </CardFooter>
      </Card>
    );
  }

  const verificationToken = await prisma.verificationToken.findUnique({
    where: {
      token,
    },
  });

  const email = verificationToken?.identifier;

  if (!email) {
    return (
      <Card variant="error">
        <CardHeader>
          <CardTitle>Invalid token</CardTitle>
        </CardHeader>
        <CardFooter>
          <Link className={buttonVariants()} href="/account">
            Account
          </Link>
        </CardFooter>
      </Card>
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return (
      <Card variant="error">
        <CardHeader>
          <CardTitle>User not found</CardTitle>
        </CardHeader>
        <CardFooter>
          <Link className={buttonVariants()} href="/account">
            Account
          </Link>
        </CardFooter>
      </Card>
    );
  }

  if (user.emailVerified) {
    redirect(
      createSearchParamsMessageUrl(
        "/account",
        "Your email has been verified.",
        "success"
      ),
    );
  }

  await prisma.user.update({
    where: {
      email,
    },
    data: {
      emailVerified: new Date(),
    },
  });

  await prisma.verificationToken.delete({
    where: {
      token,
    },
  });

  redirect(
    createSearchParamsMessageUrl(
      "/account",
      "Your email has been verified.",
      "success"
    ),
  );
}
