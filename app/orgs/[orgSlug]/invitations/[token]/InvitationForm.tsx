"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmitButton } from "@/features/form/SubmitButton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useFormState } from "react-dom";
import { Organization, VerificationToken } from "@prisma/client";

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
              />
              <p className="text-sm text-muted-foreground">
                At least 8 characters with letters and numbers
              </p>
            </div>
            {state.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}
            <SubmitButton className="w-full">
              Create Account & Join {organization.name}
            </SubmitButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
