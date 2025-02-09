import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { MailCheck } from "lucide-react";
import Image from "next/image";
import { SiteConfig } from "@/config/site-config-full";
import { VerifyContent } from "./verify-content";

interface VerifyRequestPageProps {
  searchParams: { email?: string };
}

export default async function VerifyRequestPage({
  searchParams,
}: VerifyRequestPageProps) {
  const email = searchParams.email;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 relative">
      {/* Header */}
      <header className="relative flex items-center gap-2 p-6">
        <Image 
          src={SiteConfig.appIcon} 
          alt="app icon" 
          width={40} 
          height={40}
          className="rounded-xl shadow-sm"
        />
        <Typography variant="h3" className="font-semibold">
          {SiteConfig.title}
        </Typography>
      </header>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center px-4 py-12">
        {!email ? (
          <Card className="w-full max-w-md border-2 shadow-lg">
            <CardHeader className="space-y-4 text-center">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <MailCheck className="w-8 h-8 text-destructive" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold !mt-0">
                  Error
                </CardTitle>
                <CardDescription className="text-base">
                  No email address provided. Please try signing up again.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        ) : (
          <VerifyContent email={email} />
        )}
      </div>
    </div>
  );
}
