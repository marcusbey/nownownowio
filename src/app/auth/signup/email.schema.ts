import { z } from "zod";

const EMAIL_REQUIRED = 'Please enter your email address';
const EMAIL_INVALID = 'Please enter a valid email address';

export const emailSchema = z.object({
  email: z.string()
    .min(1, EMAIL_REQUIRED)
    .email(EMAIL_INVALID)
    .toLowerCase(),
});

export type EmailSchema = z.infer<typeof emailSchema>;
