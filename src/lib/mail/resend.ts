import { Resend } from "resend";
import { env } from "../env";

let resendInstance: Resend | null = null;

async function getResendInstance() {
  if (!resendInstance) {
    resendInstance = new Resend(env.RESEND_API_KEY);
    await resendInstance.init();
  }
  return resendInstance;
}

export async function getResend() {
  return getResendInstance();
}

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html?: string;
  react?: JSX.Element;
  from?: string;
}

export async function sendEmail(params: SendEmailParams) {
  'use server'
  
  const resendClient = await getResendInstance();
  const to = Array.isArray(params.to) ? params.to : [params.to];
  
  return resendClient.emails.send({
    from: params.from || env.RESEND_EMAIL_FROM,
    to,
    subject: params.subject,
    html: params.html,
    react: params.react,
  } as any); // Type assertion needed due to Resend types not including react
}
