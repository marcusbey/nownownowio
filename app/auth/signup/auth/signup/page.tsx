import { Card, CardContent, CardHeader, CardTitle } from "@/components/data-display/card";
import { Loader } from "@/components/feedback/loader";
import { Typography } from "@/components/data-display/typography";
import { auth } from "@/lib/auth/helper";
import { SiteConfig } from "@/site-config";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SignUpCredentialsForm } from "./SignUpCredentialsForm";

export default async function AuthSignInPage() {
  const user = await auth();

  if (user) {
    redirect("/");
  }

  if (!SiteConfig.features.enablePasswordAuth) {
    redirect("/auth/signin");
  }

  return (
    <div className="flex h-full flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center gap-2">
          <Link
            href="/"
            className=" flex items-center gap-1 text-base font-bold"
          >
            <span>N</span>
            <Image
              src={SiteConfig.appIcon}
              alt="app logo"
              width={32}
              height={32}
            />
            <span>WNOWNOW</span>
          </Link>
        </div>
      </header>
      <div className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-col items-center justify-center">
            <CardTitle>Sign up</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Loader />}>
              <SignUpCredentialsForm />
            </Suspense>

            <Typography variant="small" className="mt-4">
              You already have an account?{" "}
              <Typography variant="link" as={Link} href="/auth/signin">
                Sign in
              </Typography>
            </Typography>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
