import { SiteConfig } from "@/site-config";
import { EmailLink, EmailText } from "@/emails/utils/components.utils";
import { BaseTransactionalEmail } from "./BaseTransactionalEmail";

export default function VerifyEmail({ url }: { url: string }) {
  return (
    <BaseTransactionalEmail
      previewText="Please click the link below to sign in to your account."
      header="Verify Your Email"
      content={
        <>
          <EmailText>
            <EmailLink href={url}>
              👉 Click here to verify your email 👈
            </EmailLink>
          </EmailText>
          <EmailText>
            If you didn't request this, please ignore this email.
          </EmailText>
        </>
      }
    />
  );
}
