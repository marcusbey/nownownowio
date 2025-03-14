"use server";

import { Resend } from "resend";
import { env } from "../env";
import { logger } from "../logger";

// Export this function to maintain compatibility with imports
export async function getResendInstance() {
  return getResendClient();
}

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

// Add the missing getContact function
export async function getContact(options: Parameters<Resend["contacts"]["get"]>[0]) {
  try {
    return await getResendClient().contacts.get(options);
  } catch (error) {
    logger.error("Error getting contact:", error);
    throw error;
  }
}

// Export individual async functions instead of an object to comply with server action requirements
export async function createContactWrapper(options: Parameters<Resend["contacts"]["create"]>[0]) {
  return createContact(options);
}

export async function updateContactWrapper(options: Parameters<Resend["contacts"]["update"]>[0]) {
  return updateContact(options);
}

export async function removeContactWrapper(options: Parameters<Resend["contacts"]["remove"]>[0]) {
  return removeContact(options);
}

export async function getContactWrapper(options: Parameters<Resend["contacts"]["get"]>[0]) {
  return getContact(options);
}
