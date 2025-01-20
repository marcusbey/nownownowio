import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { getResendInstance } from "./resend";

/**
 * sendEmail will send an email using resend.
 * To avoid repeating the same "from" email, you can leave it empty and it will use the default one.
 * Also, in development, it will add "[DEV]" to the subject.
 * @param params : payload
 * @returns a promise of the email sent
 */
export async function sendEmail(params: {
  to: string[];
  subject: string;
  html: string;
  from?: string;
}) {
  if (env.NODE_ENV === "development") {
    params.subject = `[DEV] ${params.subject}`;
  }
  const resend = await getResendInstance();
  const result = await resend.emails.send({
    from: params.from ?? env.RESEND_EMAIL_FROM,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });

  if (result.error) {
    logger.error("[sendEmail] Error", { result, subject: params.subject });
  }

  return result;
}
