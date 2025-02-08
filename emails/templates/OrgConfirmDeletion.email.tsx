import { SiteConfig } from "@/config";
import { EmailText } from "@/emails/utils/components.utils";
import { BaseTransactionalEmail } from "./BaseTransactionalEmail";

export default function OrgConfirmDeletionEmail({ org }: { org: string }) {
  return (
    <BaseTransactionalEmail
      previewText={`Your organization has been deleted. All your data, related to your organization, have been removed from our system.`}
      header="Organization Deleted"
      content={
        <>
          <EmailText>Hi,</EmailText>
          <EmailText>
            We just wanted to let you know that the organization {org} has been
            permanently deleted. All your data, related to your organization, have
            been removed from our system.
          </EmailText>
        </>
      }
    />
  );
}
