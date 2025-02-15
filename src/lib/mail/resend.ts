"use server";

import { Resend } from "resend";
import { env } from "../env";
import { logger } from "../logger";

const getResendClient = () => {
  if (!env.RESEND_API_KEY) {
    const message = "Missing Resend API key";
    logger.error(message);
    throw new Error(message);
  }

  return new Resend(env.RESEND_API_KEY);
};

export async function sendEmail(options: Parameters<Resend["emails"]["send"]>[0]) {
  try {
    return await getResendClient().emails.send(options);
  } catch (error) {
    logger.error("Error sending email:", error);
    throw error;
  }
}

export async function createContact(options: Parameters<Resend["contacts"]["create"]>[0]) {
  try {
    return await getResendClient().contacts.create(options);
  } catch (error) {
    logger.error("Error creating contact:", error);
    throw error;
  }
}

export async function updateContact(options: Parameters<Resend["contacts"]["update"]>[0]) {
  try {
    return await getResendClient().contacts.update(options);
  } catch (error) {
    logger.error("Error updating contact:", error);
    throw error;
  }
}

export async function removeContact(options: Parameters<Resend["contacts"]["remove"]>[0]) {
  try {
    return await getResendClient().contacts.remove(options);
  } catch (error) {
    logger.error("Error removing contact:", error);
    throw error;
  }
}
