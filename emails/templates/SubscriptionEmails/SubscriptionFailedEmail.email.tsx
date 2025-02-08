import { SiteConfig } from "@/config";
import { EmailLink, EmailText } from "@/emails/utils/components.utils";
import { BaseTransactionalEmail } from "./BaseTransactionalEmail";

export default function SubscriptionFailedEmail({
  organizationName,
  portalUrl,
}: {
  organizationName: string;
  portalUrl: string;
}) {
  return (
    <BaseTransactionalEmail
      previewText={`Important information about your ${organizationName} account on ${SiteConfig.title}`}
      header="Payment Issue Detected"
      content={
        <>
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
        </>
      }
    />
  );
}
