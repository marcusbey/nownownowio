import { LogoSvg } from "@/components/icons/logo-svg";
import { Alert, AlertDescription, AlertTitle } from "@/components/feedback/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/data-display/card";
import { HeaderBase } from "@/features/layout/header-base";
import { auth } from "@/lib/auth/helper";
import type { PageParams } from "@/types/next";
import { AlertTriangle } from "lucide-react";
import { redirect } from "next/navigation";
import { getError } from "../error/auth-error-mapping";
import { SignInProviders } from "./SignInProviders";

export default async function AuthSignInPage(props: PageParams) {
  // In Next.js 15, searchParams is a Promise that needs to be awaited
  const searchParams = await props.searchParams;
  const { errorMessage, error } = getError(searchParams.error);

  const user = await auth();

  if (user) {
    // In Next.js 15, redirect doesn't accept a second options parameter
    redirect("/account");
  }

  return (
    <div className="flex h-full flex-col">
      <HeaderBase />
      <div className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-md lg:max-w-lg lg:p-6">
          <CardHeader className="flex flex-col items-center justify-center gap-2">
            <LogoSvg />
            <CardTitle>Sign in to your account</CardTitle>
          </CardHeader>
          <CardContent className="mt-8">
            <SignInProviders />
          </CardContent>
          {error ? (
            <Alert>
              <AlertTriangle size={16} />
              <AlertDescription>{error}</AlertDescription>
              <AlertTitle>{errorMessage}</AlertTitle>
            </Alert>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
