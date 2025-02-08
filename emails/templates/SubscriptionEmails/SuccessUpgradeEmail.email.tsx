import { SiteConfig } from "@/config";
import { EmailText } from "@/emails/utils/components.utils";
import { BaseTransactionalEmail } from "./BaseTransactionalEmail";

export default function SuccessUpgradeEmail() {
  return (
    <BaseTransactionalEmail
      previewText={`You have successfully upgraded your account to ${SiteConfig.title}`}
      header="Welcome to Premium!"
      content={
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
      }
    />
  );
}
