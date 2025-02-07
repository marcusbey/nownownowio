import { getServerUrl } from "@/lib/server-url";
import { SiteConfig } from "@/site-config";
import { Button, Section } from "@react-email/components";
import { EmailText } from "@/emails/utils/components.utils";
import { BaseTransactionalEmail } from "./BaseTransactionalEmail";

type Props = {
  token: string;
  orgSlug: string;
  organizationName: string;
  expiresIn: string;
};

export default function OrganizationInvitationEmail({
  token,
  orgSlug,
  organizationName,
  expiresIn,
}: Props) {
  const url = `${getServerUrl()}/orgs/${orgSlug}/invitations/${token}`;
  return (
    <BaseTransactionalEmail
      previewText={`You've been invited to join ${organizationName}`}
      header="Organization Invitation"
      content={
        <>
          <EmailText>
            You've been invited to join {organizationName} on NowNowNow. Click the button below to accept
            the invitation and join the organization.
          </EmailText>
          <EmailText className="text-sm text-gray-500">
            This invitation will expire in {expiresIn}.
          </EmailText>
          <Section className="mt-8 text-center">
            <Button href={url}>Accept Invitation</Button>
          </Section>
          <EmailText className="mt-8 text-sm text-gray-500">
            If you don't want to join this organization, you can ignore this email. The invitation
            will expire automatically.
          </EmailText>
        </>
      }
    />
  );
}
