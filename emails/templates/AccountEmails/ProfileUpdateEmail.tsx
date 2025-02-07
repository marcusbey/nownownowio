import { EmailText } from "@/emails/utils/components.utils";
import { BaseTransactionalEmail } from "./BaseTransactionalEmail";

export default function ProfileUpdateEmail({
  verificationToken,
}: {
  verificationToken: string;
}) {
  return (
    <BaseTransactionalEmail
      previewText="Verify your profile update request"
      header="Profile Update Verification"
      content={
        <>
          <EmailText>Hi there,</EmailText>
          <EmailText>You have requested to update your profile email.</EmailText>
          <EmailText>Here is your verification code: {verificationToken}</EmailText>
          <EmailText>⚠️ If you didn't request this, please ignore this email.</EmailText>
        </>
      }
    />
  );
}
