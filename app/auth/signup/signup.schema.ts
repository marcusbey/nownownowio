import { z } from "zod";

// Form validation messages
const VALIDATION_MESSAGES = {
  EMAIL: {
    REQUIRED: 'Please enter your email address',
    INVALID: 'Please enter a valid email address',
  },
  NAME: {
    MIN: 'Name must be at least 2 characters',
    MAX: 'Name cannot be longer than 50 characters',
  },
  PASSWORD: {
    MIN: 'Password must be at least 8 characters',
    LETTER: 'Password must contain at least one letter',
    NUMBER: 'Password must contain at least one number',
    MATCH: 'Passwords do not match',
  },
} as const;

export const LoginCredentialsFormScheme = z.object({
  email: z.string()
    .min(1, VALIDATION_MESSAGES.EMAIL.REQUIRED)
    .email(VALIDATION_MESSAGES.EMAIL.INVALID)
    .toLowerCase(),
  name: z.string()
    .min(2, VALIDATION_MESSAGES.NAME.MIN)
    .max(50, VALIDATION_MESSAGES.NAME.MAX),
  password: z
    .string()
    .min(8, VALIDATION_MESSAGES.PASSWORD.MIN)
    .regex(/[A-Za-z]/, VALIDATION_MESSAGES.PASSWORD.LETTER)
    .regex(/[0-9]/, VALIDATION_MESSAGES.PASSWORD.NUMBER),
  verifyPassword: z.string(),
}).refine((data) => data.password === data.verifyPassword, {
  message: VALIDATION_MESSAGES.PASSWORD.MATCH,
  path: ['verifyPassword'],
});

export type LoginCredentialsFormType = z.infer<typeof LoginCredentialsFormScheme>;
