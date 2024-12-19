"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmitButton } from "@/features/form/SubmitButton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useFormState } from "react-dom";
import { AlertCircle } from "lucide-react";
import { createAccount } from "./actions";

interface InvitationFormProps {
  token: string;
  email: string;
  organizationName: string;
}

export function InvitationForm({ token, email, organizationName }: InvitationFormProps) {
  const [state, formAction] = useFormState(createAccount, { error: null });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete your profile</CardTitle>
        <CardDescription>
          Set up your account to join {organizationName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="email" value={email} />

          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Choose a Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className={state.error ? "border-destructive" : ""}
            />
            <p className="text-sm text-muted-foreground">
              At least 8 characters with letters and numbers
            </p>
            {state.error && (
              <div className="flex items-center gap-x-2 text-sm text-destructive font-medium">
                <AlertCircle className="h-4 w-4" />
                <p>{state.error}</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="bg-muted"
            />
          </div>

          <SubmitButton className="w-full">
            Create Account & Join {organizationName}
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
