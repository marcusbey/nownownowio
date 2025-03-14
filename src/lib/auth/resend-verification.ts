"use server";

import { resendVerificationEmail as originalResendVerificationEmail } from "../../../app/auth/signup/auth/verify-request/resend.action";

// Re-export the function
export { resendVerificationEmail } from "../../../app/auth/signup/auth/verify-request/resend.action";
