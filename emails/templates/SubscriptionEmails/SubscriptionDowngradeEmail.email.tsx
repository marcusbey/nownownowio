import { SiteConfig } from "@/config";
import { EmailLink, EmailText } from "@/emails/utils/components.utils";
import { BaseTransactionalEmail } from "../BaseTransactionalEmail";

export default function SubscriptionDowngradeEmail({ url }: { url: string }) {
  return (
    <BaseTransactionalEmail
      previewText="Your Premium Access Has Been Paused"
      header="Premium Access Paused"
      content={
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
            <EmailLink href={url}>
              👉 Click to Update Payment and Keep Using {SiteConfig.title} 👈
            </EmailLink>
          </EmailText>
          <EmailText>
            If you have any questions or need assistance, our team is always here
            to help.
          </EmailText>
        </>
      }
    />
  );
}
