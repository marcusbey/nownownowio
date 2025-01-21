'use server'

import { Resend } from "resend";
import { env } from "../env";

let resendInstance: Resend | null = null;

export async function getResendInstance() {
  if (!resendInstance) {
    resendInstance = new Resend(env.RESEND_API_KEY);
  }
  return resendInstance;
}

export const resend = getResendInstance();

export async function sendEmail(params: {
  to: string | string[];
  subject: string;
  html?: string;
  react?: JSX.Element;
  from?: string;
}) {
  const resendClient = await getResendInstance();
  const to = Array.isArray(params.to) ? params.to : [params.to];
  
  return resendClient.emails.send({
    from: params.from || env.RESEND_EMAIL_FROM,
    to,
    subject: params.subject,
    html: params.html,
    react: params.react,
  });
}
