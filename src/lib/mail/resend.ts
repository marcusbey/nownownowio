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

export async function sendEmail(params: {
  to: string[];
  subject: string;
  html: string;
  from?: string;
}) {
  const resend = await getResendInstance();
  return resend.emails.send({
    from: params.from || env.RESEND_EMAIL_FROM,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
}
