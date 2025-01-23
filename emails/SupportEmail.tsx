import * as React from "react";

interface SupportEmailProps {
  message: string;
}

export function SupportEmail({ message }: SupportEmailProps) {
  return (
    <div>
      <p>{message}</p>
    </div>
  );
}
