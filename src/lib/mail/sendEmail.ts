"use server";

import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { Resend } from "resend";

type EmailPayload = Parameters<Resend["emails"]["send"]>[0];
type EmailOptions = Parameters<Resend["emails"]["send"]>[1];

interface EmailParams {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: EmailPayload["attachments"];
}

const getResendClient = () => {
  if (!env.RESEND_API_KEY) {
    const message = "Missing Resend API key";
    logger.error(message);
    throw new Error(message);
  }

  return new Resend(env.RESEND_API_KEY);
};

/**
 * sendEmail will send an email using resend.
 * To avoid repeating the same "from" email, you can leave it empty and it will use the default one.
 * Also, in development, it will add "[DEV]" to the subject.
 * @param params The email parameters
 * @param options Additional options for sending the email
 * @returns A promise of the email sent
 */
export async function sendEmail(params: EmailParams, options?: EmailOptions) {
  const payload = {
    from: params.from ?? env.RESEND_EMAIL_FROM,
    ...params,
    subject: env.NODE_ENV === "development" ? `[DEV] ${params.subject}` : params.subject,
  };

  try {
    const result = await getResendClient().emails.send(payload, options);

    if ("error" in result) {
      logger.error("[sendEmail] Error", { result, subject: params.subject });
    }

    return result;
  } catch (error) {
    logger.error("[sendEmail] Failed to send email", { error, subject: params.subject });
    throw error;
  }
}
