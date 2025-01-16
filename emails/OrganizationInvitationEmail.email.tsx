import { getServerUrl } from "@/lib/server-url";
import { SiteConfig } from "@/site-config";
import { Preview, Text, Heading, Section, Button } from "@react-email/components";
import { EmailLayout } from "./utils/EmailLayout";
import { EmailLink, EmailSection, EmailText } from "./utils/components.utils";

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
    <EmailLayout preview={`You've been invited to join ${organizationName}`}>
      <Heading>Organization Invitation</Heading>
      <Text>
        You've been invited to join {organizationName} on NowNowNow. Click the button below to accept
        the invitation and join the organization.
      </Text>
      <Text className="text-sm text-gray-500">
        This invitation will expire in {expiresIn}.
      </Text>
      <Section className="mt-8 text-center">
        <Button href={url}>Accept Invitation</Button>
      </Section>
      <Text className="mt-8 text-sm text-gray-500">
        If you don't want to join this organization, you can ignore this email. The invitation
        will expire automatically.
      </Text>
      <Text className="text-lg leading-6">
        Best,
        <br />- {SiteConfig.maker.name} from {SiteConfig.title}
      </Text>
    </EmailLayout>
  );
}
