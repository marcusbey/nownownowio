import { auth } from "@/lib/auth/helper";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { PageParams } from "@/types/next";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeaderBase } from "@/features/layout/HeaderBase";

export default async function VerifyPage({ searchParams }: PageParams) {
  const token = searchParams.token;
  const user = await auth();

  if (user) {
    redirect("/account");
  }

  if (!token) {
    redirect("/auth/signin");
  }

  try {
    // Find the token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return (
        <div className="flex h-full flex-col">
          <HeaderBase />
          <div className="flex flex-1 items-center justify-center">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Invalid or Expired Token</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    This verification link is invalid or has expired. Please request a new verification email.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    // Check if token is expired
    if (verificationToken.expires < new Date()) {
      return (
        <div className="flex h-full flex-col">
          <HeaderBase />
          <div className="flex flex-1 items-center justify-center">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Link Expired</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    This verification link has expired. Please request a new verification email.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    // Update user email verification status
    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    });

    // Delete the used token
    await prisma.verificationToken.delete({
      where: { token },
    });

    // Redirect to sign in
    redirect("/auth/signin?verified=true");
  } catch (error) {
    return (
      <div className="flex h-full flex-col">
        <HeaderBase />
        <div className="flex flex-1 items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Verification Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  An error occurred while verifying your email. Please try again or request a new verification email.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
}
