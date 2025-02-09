import { EmailText } from "@/emails/utils/components.utils";
import { BaseTransactionalEmail } from "../BaseTransactionalEmail";

type SupportFeedbackEmailType = "support" | "feedback";

interface SupportFeedbackEmailProps {
  type: SupportFeedbackEmailType;
  data: {
    message: string;
    review?: number;
  };
}

export default function SupportFeedbackEmail({ type, data }: SupportFeedbackEmailProps) {
  const emailConfig = {
    support: {
      previewText: "Support Request Received",
      header: "Support Request",
      content: (
        <>
          <EmailText>Hi there,</EmailText>
          <EmailText>{data.message}</EmailText>
          <EmailText>We'll get back to you as soon as possible.</EmailText>
        </>
      ),
    },
    feedback: {
      previewText: "New Feedback Received",
      header: "User Feedback",
      content: (
        <>
          {data.review && (
            <EmailText>
              <strong>Rating:</strong> {"⭐".repeat(data.review)}
            </EmailText>
          )}
          <EmailText>
            <strong>Message:</strong> {data.message}
          </EmailText>
          <EmailText>Thank you for your feedback! We appreciate your input.</EmailText>
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
