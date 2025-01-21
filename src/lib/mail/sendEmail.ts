import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { getResend } from "./resend";

/**
 * sendEmail will send an email using resend.
 * To avoid repeating the same "from" email, you can leave it empty and it will use the default one.
 * Also, in development, it will add "[DEV]" to the subject.
 * @param params : payload
 * @returns a promise of the email sent
 */
export async function sendEmail(params: {
  to: string | string[];
  subject: string;
  html?: string;
  react?: JSX.Element;
  from?: string;
}) {
  if (env.NODE_ENV === "development") {
    params.subject = `[DEV] ${params.subject}`;
  }
  const resendClient = await getResend();
  const to = Array.isArray(params.to) ? params.to : [params.to];

  const result = await resendClient.emails.send({
    from: params.from || env.RESEND_EMAIL_FROM,
    to,
    subject: params.subject,
    html: params.html,
    react: params.react,
  } as any);

  if (result.error) {
    logger.error("[sendEmail] Error", { result, subject: params.subject });
  }

  return result;
}
