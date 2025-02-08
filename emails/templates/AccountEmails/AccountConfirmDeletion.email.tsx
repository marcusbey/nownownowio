import { SiteConfig } from "@/config";
import { EmailText } from "@/emails/utils/components.utils";
import { BaseTransactionalEmail } from "./BaseTransactionalEmail";

export default function AccountConfirmDeletionEmail() {
  return (
    <BaseTransactionalEmail
      previewText="Your account has been deleted. All your data, including any organizations you owned, have been removed from our system."
      header="Account Deleted"
      content={
        <>
          <EmailText>Hi,</EmailText>
          <EmailText>
            We wanted to let you know that your account has been permanently
            deleted. All your data, including any organizations you owned, have
            been removed from our system.
          </EmailText>
          <EmailText>
            If you have any questions or need further assistance, please do not
            hesitate to contact our support team.
          </EmailText>
        </>
      }
    />
  );
}
