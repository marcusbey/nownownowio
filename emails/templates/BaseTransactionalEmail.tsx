import { SiteConfig } from "@/config";
import { Preview, Text, Container, Section, Hr } from "@react-email/components";
import { EmailLayout } from "@/emails/utils/EmailLayout";
import { EmailSection } from "@/emails/utils/components.utils";

interface TransactionalEmailProps {
  previewText: string;
  header?: React.ReactNode;
  content: React.ReactNode;
  footer?: React.ReactNode;
  actionButton?: {
    text: string;
    url: string;
  };
  showSignature?: boolean;
  customSignature?: string;
  theme?: "light" | "dark";
}

export function BaseTransactionalEmail({
  previewText,
  header,
  content,
  footer,
  actionButton,
  showSignature = true,
  customSignature,
  theme = "light",
}: TransactionalEmailProps) {
  const backgroundColor = theme === "light" ? "#ffffff" : "#1a1a1a";
  const textColor = theme === "light" ? "#000000" : "#ffffff";

  return (
    <EmailLayout>
      <Preview>{previewText}</Preview>
      <Container style={{ backgroundColor, color: textColor }}>
        {header && (
          <Section style={{ padding: "20px 0" }}>
            {header}
          </Section>
        )}
        
        <Section style={{ padding: "20px 0" }}>
          {content}
        </Section>

        {actionButton && (
          <Section style={{ textAlign: "center", padding: "20px 0" }}>
            <a
              href={actionButton.url}
              style={{
                backgroundColor: "#0070f3",
                color: "#ffffff",
                padding: "12px 24px",
                borderRadius: "4px",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              {actionButton.text}
            </a>
          </Section>
        )}

        {footer && (
          <>
            <Hr style={{ borderColor: textColor, opacity: 0.2 }} />
            <Section style={{ padding: "20px 0" }}>
              {footer}
            </Section>
          </>
        )}

        {showSignature && (
          <Section style={{ padding: "20px 0" }}>
            <Text style={{ fontSize: "16px", lineHeight: "24px" }}>
              {customSignature || (
                <>
                  Best,
                  <br />- {SiteConfig.maker.name} from {SiteConfig.title}
                </>
              )}
            </Text>
          </Section>
        )}
      </Container>
    </EmailLayout>
  );
}
