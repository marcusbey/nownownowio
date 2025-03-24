import { z } from "zod";

export const ProfileFormSchema = z.object({
  name: z.string().nullable(),
  displayName: z.string().min(1, "Display name is required"),
  email: z.string().email(),
  image: z.string().nullable(),
});

export const EditPasswordFormSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(8),
});

export const SetInitialPasswordFormSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type ProfileFormType = z.infer<typeof ProfileFormSchema>;
export type EditPasswordFormType = z.infer<typeof EditPasswordFormSchema>;
export type SetInitialPasswordFormType = z.infer<typeof SetInitialPasswordFormSchema>;
