import VerificationEmail from "./VerificationEmails";
import type { VerificationEmailProps } from "./VerificationEmails";

interface MagicLinkMailProps {
  url: string;
}

export function MagicLinkMail({ url }: MagicLinkMailProps) {
  const emailProps: VerificationEmailProps = {
    type: "magicLink",
    data: {
      url,
      expiresIn: "1 hour"
    }
  };

  return <VerificationEmail {...emailProps} />;
}
