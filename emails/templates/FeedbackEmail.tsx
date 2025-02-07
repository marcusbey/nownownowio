import { EmailText } from "@/emails/utils/components.utils";
import { BaseTransactionalEmail } from "./BaseTransactionalEmail";

interface FeedbackEmailProps {
  review: number;
  message: string;
}

export function FeedbackEmail({ review, message }: FeedbackEmailProps) {
  return (
    <BaseTransactionalEmail
      previewText="New Feedback Received"
      header="User Feedback"
      content={
        <>
          <EmailText><strong>Rating:</strong> {"⭐".repeat(review)}</EmailText>
          <EmailText><strong>Message:</strong> {message}</EmailText>
          <EmailText>Thank you for your feedback! We appreciate your input.</EmailText>
        </>
      }
    />
  );
}
