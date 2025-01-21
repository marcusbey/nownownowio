"use server";

import { getResendInstance } from "./resend";

interface SendEmailParams {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
  from?: string;
}

/**
 * sendEmail will send an email using resend.
 * To avoid repeating the same "from" email, you can leave it empty and it will use the default one.
 * Also, in development, it will add "[DEV]" to the subject.
 * @param params : payload
 * @returns a promise of the email sent
 */
export async function sendEmail(params: SendEmailParams) {
  if (env.NODE_ENV === "development") {
    params.subject = `[DEV] ${params.subject}`;
  }
  const resend = await getResendInstance();
  
  const to = Array.isArray(params.to) ? params.to : [params.to];

  const result = await resend.emails.send({
    from: params.from || "NowNowNow <no-reply@nownownow.io>",
    to,
    subject: params.subject,
    react: params.react,
  } as any);

  if (result.error) {
    logger.error("[sendEmail] Error", { result, subject: params.subject });
  }

  return result;
}
