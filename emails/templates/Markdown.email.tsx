import { Markdown } from "@react-email/components";
import { BaseTransactionalEmail } from "./BaseTransactionalEmail";

export default function MarkdownEmail(props: {
  markdown: string;
  preview?: string;
}) {
  return (
    <BaseTransactionalEmail
      previewText={props.preview ?? "You receive a markdown email."}
      header="Markdown Content"
      content={
        <Markdown
          markdownCustomStyles={{
            p: {
              fontSize: "1.125rem",
              lineHeight: "1.5rem",
            },
            li: {
              fontSize: "1.125rem",
              lineHeight: "1.5rem",
            },
            link: {
              color: "#6366f1",
            },
          }}
        >
          {props.markdown}
        </Markdown>
      }
    />
  );
}
