import { EmailText } from "@/emails/utils/components.utils";
import { BaseTransactionalEmail } from "./BaseTransactionalEmail";

interface SupportEmailProps {
  message: string;
}

export function SupportEmail({ message }: SupportEmailProps) {
  return (
    <BaseTransactionalEmail
      previewText="Support Request Received"
      header="Support Request"
      content={
        <>
          <EmailText>Hi there,</EmailText>
          <EmailText>{message}</EmailText>
          <EmailText>We'll get back to you as soon as possible.</EmailText>
        </>
      }
    />
  );
}
