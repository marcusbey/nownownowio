import { LogoSvg } from "@/components/ui/svg/LogoSvg";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeaderBase } from "@/features/layout/HeaderBase";
import { auth } from "@/lib/auth/helper";
import type { PageParams } from "@/types/next";
import { AlertTriangle } from "lucide-react";
import { redirect } from "next/navigation";
import { getError } from "../error/auth-error-mapping";
import { SignInProviders } from "./SignInProviders";
import { AuthQueryProvider } from "../AuthQueryProvider";

export default async function AuthSignInPage(props: PageParams) {
  const { errorMessage, error } = getError(props.searchParams.error);

  const user = await auth();

  if (user) {
    redirect("/account", { scroll: false });
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
            <AuthQueryProvider>
              <SignInProviders />
            </AuthQueryProvider>
          </CardContent>
          {error ? (
            <Alert className="mt-4" variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="ml-2">{errorMessage}</AlertTitle>
            </Alert>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
