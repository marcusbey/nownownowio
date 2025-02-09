import { SiteConfig } from "@/config";
import { Button, Section } from "@react-email/components";
import { BaseTransactionalEmail } from "../BaseTransactionalEmail";
import { EmailLink, EmailText } from "@/emails/utils/components.utils";
import { getServerUrl } from "@/lib/server-url";

export type VerificationEmailType = "magicLink" | "orgInvitation" | "verifyEmail";

export interface VerificationEmailProps {
  type: VerificationEmailType;
  data: {
    url?: string;
    token?: string;
    orgSlug?: string;
    organizationName?: string;
    expiresIn?: string;
  };
}

export default function VerificationEmail({ type, data }: VerificationEmailProps) {
  const emailConfig = {
    magicLink: {
      previewText: "You have requested a magic link to sign in to your account.",
      header: "Sign In to Your Account",
      content: (
        <>
          <EmailText>
            <EmailLink href={data.url}>👉 Click here to sign in 👈</EmailLink>
          </EmailText>
          <EmailText>
            If you didn't request this, please ignore this email.
          </EmailText>
        </>
      ),
    },
    orgInvitation: {
      previewText: `You've been invited to join ${data.organizationName}`,
      header: "Organization Invitation",
      content: (
        <>
          <EmailText>
            You've been invited to join {data.organizationName} on NowNowNow. Click the button below to accept
            the invitation and join the organization.
          </EmailText>
          <EmailText className="text-sm text-gray-500">
            This invitation will expire in {data.expiresIn}.
          </EmailText>
          <Section className="mt-8 text-center">
            <Button 
              href={`${getServerUrl()}/orgs/${data.orgSlug}/invitations/${data.token}`}
            >
              Accept Invitation
            </Button>
          </Section>
          <EmailText className="mt-8 text-sm text-gray-500">
            If you don't want to join this organization, you can ignore this email. The invitation
            will expire automatically.
          </EmailText>
        </>
      ),
    },
    verifyEmail: {
      previewText: "Verify your email address to complete registration",
      header: "Email Verification",
      content: (
        <>
          <EmailText>
            Click the button below to verify your email and activate your NowNowNow account.
          </EmailText>
          <EmailText className="text-muted-foreground text-sm">
            This link expires in {data.expiresIn}.
          </EmailText>
          <Section className="mt-6 text-center">
            <Button
              className="bg-primary text-primary-foreground rounded-lg px-6 py-3"
              href={data.url}
            >
              Verify Email
            </Button>
          </Section>
        </>
      ),
    },
  };

  const config = emailConfig[type];

  return (
    <BaseTransactionalEmail
      previewText={config.previewText}
      header={config.header}
      content={config.content}
    />
  );
}
