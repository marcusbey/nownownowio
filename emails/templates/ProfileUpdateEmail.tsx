import { Html, Text } from "@react-email/components";
import { EmailLayout } from "./utils/EmailLayout";

export default function ProfileUpdateEmail({
  verificationToken,
}: {
  verificationToken: string;
}) {
  return (
    <EmailLayout>
      <Text>Hi there,</Text>
      <Text>You have requested to update your profile email.</Text>
      <Text>Here is your verification code: {verificationToken}</Text>
      <Text>⚠️ If you didn't request this, please ignore this email.</Text>
      <Text>Best regards,</Text>
      <Text>The NowNowNow Team</Text>
    </EmailLayout>
  );
}
