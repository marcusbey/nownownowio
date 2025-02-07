import { SiteConfig } from "@/site-config";
import { EmailLink, EmailText } from "@/emails/utils/components.utils";
import { BaseTransactionalEmail } from "./BaseTransactionalEmail";

export default function AccountAskDeletionEmail({
  organizationsToDelete,
  confirmUrl,
}: {
  organizationsToDelete: string[];
  confirmUrl: string;
}) {
  return (
    <BaseTransactionalEmail
      previewText="Action required: You need to confirm your account deletion."
      header="Confirm Account Deletion"
      content={
        <>
          <EmailText>Hi,</EmailText>
          <EmailText>
            You have requested the deletion of your account. The deletion is not
            yet effective. Please confirm your request by clicking the link below:
          </EmailText>
          <EmailText>
            <EmailLink href={confirmUrl}>
              👉 Confirm Account Deletion 👈
            </EmailLink>
          </EmailText>
          <EmailText>
            You have 1 hour to confirm your request. After, the request will be
            invalid.
          </EmailText>
          {organizationsToDelete.length > 0 && (
            <EmailText>
              The following organizations will also be deleted:
              <ul>
                {organizationsToDelete.map((org) => (
                  <li key={org}>{org}</li>
                ))}
              </ul>
            </EmailText>
          )}
        </>
      }
    />
  );
}
