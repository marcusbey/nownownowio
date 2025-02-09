import { SiteConfig } from "@/config";
import { EmailLink, EmailText } from "@/emails/utils/components.utils";
import { BaseTransactionalEmail } from "../BaseTransactionalEmail";

type EmailType = "askDeletion" | "confirmDeletion" | "profileUpdate";

interface AccountEmailProps {
  type: EmailType;
  data?: {
    organizationsToDelete?: string[];
    confirmUrl?: string;
    updates?: Record<string, any>;
  };
}

export default function AccountEmail({ type, data }: AccountEmailProps) {
  const emailConfig = {
    askDeletion: {
      previewText: "Action required: You need to confirm your account deletion.",
      header: "Confirm Account Deletion",
      content: (
        <>
          <EmailText>Hi,</EmailText>
          <EmailText>
            You have requested the deletion of your account. The deletion is not
            yet effective. Please confirm your request by clicking the link below:
          </EmailText>
          <EmailText>
            <EmailLink href={data?.confirmUrl}>
              👉 Confirm Account Deletion 👈
            </EmailLink>
          </EmailText>
          <EmailText>
            You have 1 hour to confirm your request. After, the request will be
            invalid.
          </EmailText>
          {data?.organizationsToDelete && data.organizationsToDelete.length > 0 && (
            <EmailText>
              The following organizations will also be deleted:
              <ul>
                {data.organizationsToDelete.map((org) => (
                  <li key={org}>{org}</li>
                ))}
              </ul>
            </EmailText>
          )}
        </>
      ),
    },
    confirmDeletion: {
      previewText:
        "Your account has been deleted. All your data, including any organizations you owned, have been removed from our system.",
      header: "Account Deleted",
      content: (
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
      ),
    },
    profileUpdate: {
      previewText: "Your profile has been updated successfully.",
      header: "Profile Updated",
      content: (
        <>
          <EmailText>Hi,</EmailText>
          <EmailText>
            Your profile has been successfully updated with the following changes:
          </EmailText>
          {data?.updates && (
            <EmailText>
              <ul>
                {Object.entries(data.updates).map(([field, value]) => (
                  <li key={field}>
                    {field}: {value}
                  </li>
                ))}
              </ul>
            </EmailText>
          )}
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
