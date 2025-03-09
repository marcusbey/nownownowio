import { Typography } from "@/components/data-display/typography";
import { Button } from "@/components/core/button";
import { SiteConfig } from "@/site-config";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/data-display/card";
import { XCircle } from "lucide-react";

export default async function VerifyEmailPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  // Next.js 15 requires awaiting dynamic route parameters
  const awaitedParams = await params;
  const token = awaitedParams.token;
  
  // Process the verification token and handle success/failure
  const { isSuccess, errorMessage } = await processVerificationToken(token);
  
  // Successful verification - redirect to orgs page
  if (isSuccess) {
    redirect("/orgs");
  }
  
  // If we reach here, verification failed - show error UI
  return renderErrorUI(errorMessage);
}

/**
 * Process the verification token and update user's email verification status
 */
async function processVerificationToken(token: string): Promise<{ isSuccess: boolean; errorMessage: string }> {
  let isSuccess = false;
  let errorMessage = "";

  try {
    // Find the verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    // Check if token exists and is not expired
    if (!verificationToken) {
      errorMessage = "Verification link is invalid or has expired";
      return { isSuccess, errorMessage };
    } 
    
    if (verificationToken.expires < new Date()) {
      errorMessage = "Verification link has expired";
      
      // Clean up expired token
      await prisma.verificationToken.delete({
        where: { token },
      });
      return { isSuccess, errorMessage };
    }
    
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: {
        email: verificationToken.identifier,
      },
    });

    if (!user) {
      errorMessage = "User not found";
      return { isSuccess, errorMessage };
    }
    
    // Update user's emailVerified status
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });

    // Delete the verification token
    await prisma.verificationToken.delete({
      where: { token },
    });

    isSuccess = true;
    return { isSuccess, errorMessage };
  } catch (error) {
    errorMessage = "An error occurred during verification";
    // Use proper error logging instead of console.error
    const errorDetails = error instanceof Error ? error.message : String(error);
    // This would ideally use a logger service
    return { isSuccess, errorMessage };
  }
}

/**
 * Render the error UI when verification fails
 */
function renderErrorUI(errorMessage: string) {
  return (
    <div className="h-full">
      <header className="flex items-center gap-2 px-4 pt-4">
        <Image src={SiteConfig.appIcon} alt="app icon" width={32} height={32} />
        <Typography variant="h2">{SiteConfig.title}</Typography>
      </header>
      <div className="flex h-full items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="size-6 text-red-500" />
              Verification Failed
            </CardTitle>
            <CardDescription>
              {errorMessage}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/orgs">Continue to Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
