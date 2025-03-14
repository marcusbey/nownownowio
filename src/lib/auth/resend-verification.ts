"use server";

import { resendVerificationEmail as originalResendVerificationEmail } from "../../../app/auth/signup/auth/verify-request/resend.action";

// Create a wrapper function to comply with 'use server' requirements
export async function resendVerificationEmail(params: Parameters<typeof originalResendVerificationEmail>[0]) {
  return originalResendVerificationEmail(params);
}
