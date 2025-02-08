import { SiteConfig } from "@/config";
import { Preview, Text } from "@react-email/components";
import { EmailLayout } from "@/emails/utils/EmailLayout";
import { EmailLink, EmailSection, EmailText } from "@/emails/utils/components.utils";
import { BaseTransactionalEmail } from "@/emails/templates/BaseTransactionalEmail";

export default function MagicLinkMail({ url }: { url: string }) {
  return (
    <BaseTransactionalEmail
      previewText="You have requested a magic link to sign in to your account."
      header="Sign In to Your Account"
      content={
        <>
          <EmailText>
            <EmailLink href={url}>👉 Click here to sign in 👈</EmailLink>
          </EmailText>
          <EmailText>
            If you didn't request this, please ignore this email.
          </EmailText>
        </>
      }
    />
  );
}
