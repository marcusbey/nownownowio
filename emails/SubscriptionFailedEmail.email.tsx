import { SiteConfig } from "@/site-config";
import { Preview, Text } from "@react-email/components";
import { EmailLayout } from "./utils/EmailLayout";
import { EmailLink, EmailSection, EmailText } from "./utils/components.utils";

export default function SubscriptionFailedEmail({
  organizationName,
  portalUrl,
}: {
  organizationName: string;
  portalUrl: string;
}) {
  return (
    <EmailLayout>
      <Preview>
        Important information about your {organizationName} account on {SiteConfig.title}
      </Preview>
      <EmailSection>
        <EmailText>Hello,</EmailText>
        <EmailText>
          Your last payment didn't go through, so your extra features are on
          hold.
        </EmailText>
        <EmailText>
          We've noticed an issue with your recent payment, which affects your
          access to our premium features.
        </EmailText>
        <EmailText>
          To resolve this and continue enjoying all the benefits, simply update
          your payment details through the link below. It's quick and
          straightforward!
        </EmailText>
        <EmailText>
          <EmailLink href={portalUrl}>
            👉 Click to Update Payment and Keep Using {SiteConfig.title} 👈
          </EmailLink>
        </EmailText>
        <EmailText>
          Thank you for your prompt attention to this matter. We're here to help
          if you have any questions.
        </EmailText>
      </EmailSection>
      <Text className="text-lg leading-6">
        Best,
        <br />- {SiteConfig.maker.name} from {SiteConfig.title}
      </Text>
    </EmailLayout>
  );
}
