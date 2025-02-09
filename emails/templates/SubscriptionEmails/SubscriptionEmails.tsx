import { SiteConfig } from "@/config";
import { EmailLink, EmailText } from "@/emails/utils/components.utils";
import { BaseTransactionalEmail } from "../BaseTransactionalEmail";

type SubscriptionEmailType = "downgrade" | "failed" | "upgrade";

interface SubscriptionEmailProps {
  type: SubscriptionEmailType;
  data?: {
    url?: string;
    organizationName?: string;
    portalUrl?: string;
  };
}

export default function SubscriptionEmail({ type, data }: SubscriptionEmailProps) {
  const emailConfig = {
    downgrade: {
      previewText: "Your Premium Access Has Been Paused",
      header: "Premium Access Paused",
      content: (
        <>
          <EmailText>Hello,</EmailText>
          <EmailText>
            We're reaching out to inform you that your account has reverted to our
            basic access level. This change is due to the recent issues with your
            premium subscription payment.
          </EmailText>
          <EmailText>
            While you'll still enjoy our core services, access to premium features
            is now limited. We'd love to have you back in our premium community!
          </EmailText>
          <EmailText>
            To reactivate your premium status, simply update your payment
            information here:
          </EmailText>
          <EmailText>
            <EmailLink href={data?.url}>
              👉 Click to Update Payment and Keep Using {SiteConfig.title} 👈
            </EmailLink>
          </EmailText>
          <EmailText>
            If you have any questions or need assistance, our team is always here
            to help.
          </EmailText>
        </>
      ),
    },
    failed: {
      previewText: data?.organizationName 
        ? `Important information about your ${data.organizationName} account on ${SiteConfig.title}`
        : "Payment Issue Detected",
      header: "Payment Issue Detected",
      content: (
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
            <EmailLink href={data?.portalUrl}>
              👉 Click to Update Payment and Keep Using {SiteConfig.title} 👈
            </EmailLink>
          </EmailText>
          <EmailText>
            Thank you for your prompt attention to this matter. We're here to help
            if you have any questions.
          </EmailText>
        </>
      ),
    },
    upgrade: {
      previewText: `You have successfully upgraded your account to ${SiteConfig.title}`,
      header: "Welcome to Premium!",
      content: (
        <>
          <EmailText>Hello,</EmailText>
          <EmailText>
            Great news! Your payment was successful, and you now have full access
            to all our premium features. Get ready to explore everything we have
            to offer!
          </EmailText>
          <EmailText>
            If you have any questions or need assistance as you dive in, feel free
            to reach out to us. We're here to help you make the most of your
            experience.
          </EmailText>
          <EmailText>Happy exploring,</EmailText>
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
