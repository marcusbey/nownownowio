"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/data-display/card";
import { User } from "lucide-react";
import { BannerImageForm } from "./account/BannerImageForm";
import { Alert, AlertDescription } from "@/components/feedback/alert";
import { Button } from "@/components/core/button";
import Link from "next/link";

interface PersonalAccountContentProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    emailVerified: Date | null;
    image: string | null;
  };
  orgSlug: string;
  isEmailVerified: boolean;
}

export function PersonalAccountContent({ user, orgSlug, isEmailVerified }: PersonalAccountContentProps) {
  return (
    <div className="py-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Personal Account</h2>
        <p className="text-sm text-muted-foreground">
          Manage your personal account details and preferences
        </p>
      </div>

      {!isEmailVerified && user.email && (
        <Alert variant="warning" className="mb-6">
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

      <Card className="border shadow-sm mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Account Information</CardTitle>
          <CardDescription>
            Update your personal account details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                id="name"
                className="w-full p-2 border rounded-md bg-background"
                defaultValue={user.name || ""}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                id="email"
                className="w-full p-2 border rounded-md bg-background"
                defaultValue={user.email || ""}
              />
            </div>
            <div className="pt-2">
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
