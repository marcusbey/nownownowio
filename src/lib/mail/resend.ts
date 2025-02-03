"use server";

import { Resend } from "resend";
import { env } from "../env";

let resendInstance: Resend | null = null;

async function initResendInstance() {
  if (!resendInstance) {
    resendInstance = new Resend(env.RESEND_API_KEY);
  }
  return resendInstance;
}

export async function getResendInstance() {
  return await initResendInstance();
}

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  react?: JSX.Element;
  from?: string;
}

export async function sendEmail(params: SendEmailParams) {
  'use server'
  
  try {
    const resendClient = await getResendInstance();
    const to = Array.isArray(params.to) ? params.to : [params.to];
    
    console.info('[Email] Attempting to send email', {
      to,
      from: params.from || env.RESEND_EMAIL_FROM,
      subject: params.subject
    });

    const result = await resendClient.emails.send({
      from: params.from || env.RESEND_EMAIL_FROM,
      to,
      subject: params.subject,
      html: params.html,
      text: params.text,
      react: params.react,
    } as any);

    if (!result?.id) {
      console.error('[Email] Failed to send email - no ID returned', {
        to,
        from: params.from || env.RESEND_EMAIL_FROM,
        subject: params.subject
      });
      throw new Error('Failed to send email - no ID returned');
    }

    console.info('[Email] Successfully sent email', {
      id: result.id,
      to,
      from: params.from || env.RESEND_EMAIL_FROM,
      subject: params.subject
    });

    return result;
  } catch (error) {
    console.error('[Email] Error sending email', {
      error,
      to: params.to,
      from: params.from || env.RESEND_EMAIL_FROM,
      subject: params.subject
    });
    throw error;
  }
}

export async function deleteContact(audienceId: string, email: string) {
  const resend = await getResendInstance();
  return resend.contacts.remove({
    audienceId,
    email,
  });
}

export async function createContact(audienceId: string, email: string) {
  const resend = await getResendInstance();
  return resend.contacts.create({
    audienceId,
    email,
    unsubscribed: false,
  });
}
