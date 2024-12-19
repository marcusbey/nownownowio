"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmitButton } from "@/features/form/SubmitButton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useFormState } from "react-dom";
import { Organization } from "@prisma/client";
import { createAccount } from "./actions";
import { AlertCircle } from "lucide-react";

interface InvitationFormProps {
  organization: Organization;
  tokenData: {
    orgId: string;
    email: string;
  };
  token: string;
}

export function InvitationForm({ organization, tokenData, token }: InvitationFormProps) {
  const [state, formAction] = useFormState(createAccount, { error: null });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete your profile</CardTitle>
        <CardDescription>
          Set up your account to join {organization.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <input type="hidden" name="tokenData" value={JSON.stringify(tokenData)} />
          <input type="hidden" name="organizationId" value={organization.id} />
          <input type="hidden" name="organizationSlug" value={organization.slug} />
          <input type="hidden" name="token" value={token} />
          <div className="space-y-4">
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
            <SubmitButton className="w-full">
              Create Account & Join {organization.name}
            </SubmitButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
