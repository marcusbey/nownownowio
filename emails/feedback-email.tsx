import * as React from "react";

type FeedbackEmailProps = {
  review: number;
  message: string;
}

export function FeedbackEmail({ review, message }: FeedbackEmailProps) {
  return (
    <div>
      <p><strong>Review:</strong> {review}</p>
      <p><strong>Message:</strong> {message}</p>
    </div>
  );
}
