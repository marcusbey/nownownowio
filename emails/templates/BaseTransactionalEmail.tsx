import { SiteConfig } from "@/site-config";
import { Preview, Text } from "@react-email/components";
import { EmailLayout } from "@/emails/utils/EmailLayout";
import { EmailSection } from "@/emails/utils/components.utils";

type TransactionalEmailProps = {
  previewText: string;
  header?: React.ReactNode;
  content: React.ReactNode;
  footer?: React.ReactNode;
};

export function BaseTransactionalEmail({
  previewText,
  header,
  content,
  footer,
}: TransactionalEmailProps) {
  return (
    <EmailLayout>
      <Preview>{previewText}</Preview>
      {header && <EmailSection>{header}</EmailSection>}
      <EmailSection>{content}</EmailSection>
      {footer && <EmailSection>{footer}</EmailSection>}
      <Text className="text-lg leading-6">
        Best,
        <br />- {SiteConfig.maker.name} from {SiteConfig.title}
      </Text>
    </EmailLayout>
  );
}
