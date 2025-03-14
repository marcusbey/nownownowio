"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/data-display/card";
// Removed unused import
// import { User } from "lucide-react";
import { BannerImageForm } from "./account/BannerImageForm";
import { Alert, AlertDescription } from "@/components/feedback/alert";
import { Button } from "@/components/core/button";
import Link from "next/link";
import { PersonalAccountForm } from "./account/PersonalAccountForm";

type PersonalAccountContentProps = {
  user: {
    id: string;
    name: string | null;
    displayName: string | null;
    email: string | null;
    emailVerified: Date | null;
    image: string | null;
    passwordHash?: string | null;
  };
  orgSlug: string;
  isEmailVerified: boolean;
}

export function PersonalAccountContent({ user, isEmailVerified }: PersonalAccountContentProps) {
  return (
    <div className="mx-auto max-w-4xl py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Personal Account</h2>
        <p className="text-sm text-muted-foreground">
          Manage your personal account details and preferences
        </p>
      </div>

      {/* Only show email verification alert for non-OAuth users with unverified emails */}
      {!isEmailVerified && user.email && (
        <Alert className="mb-6">
          <AlertDescription className="flex items-center justify-between">
            <span>Your email address ({user.email}) is not verified. Please verify your email to ensure account security.</span>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/api/auth/verify-email?email=${encodeURIComponent(user.email)}`}>
                Verify Email
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Use the PersonalAccountForm component and pass isEmailVerified */}
      <PersonalAccountForm user={user} isEmailVerified={isEmailVerified} />

      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Profile Banner</CardTitle>
          <CardDescription>
            Customize your profile banner image
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BannerImageForm user={user} />
        </CardContent>
      </Card>
    </div>
  );
}
