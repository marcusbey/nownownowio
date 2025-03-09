import { RESERVED_SLUGS } from "@/lib/organizations/reserved-slugs";
import { z } from "zod";
import { formatId } from "@/lib/format/id";

export const NewOrgsSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  websiteUrl: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional().or(z.literal('')),
  planId: z.enum(["BASIC_MONTHLY", "BASIC_YEARLY", "BASIC_LIFETIME", "PRO_MONTHLY", "PRO_YEARLY", "PRO_LIFETIME"]).default("PRO_MONTHLY"),
  billingPeriod: z.enum(["MONTHLY", "YEARLY", "LIFETIME"]).default("MONTHLY"),
  userEmail: z.string().optional(), // Optional field to store the user's email
}).transform((data) => {
  // Auto-generate slug from name
  const slug = formatId(data.name);
  
  // Ensure slug doesn't use reserved names
  if (RESERVED_SLUGS.includes(slug)) {
    throw new Error("This organization name results in a reserved slug");
  }
  
  return {
    name: data.name,
    slug: slug,
    // The email will be set in the action handler
    email: data.userEmail, // This will be populated in the action
    websiteUrl: data.websiteUrl ?? undefined,
    bio: data.bio ?? undefined,
    planId: data.planId,
    billingPeriod: data.billingPeriod,
  };
});

export type NewOrganizationSchemaType = z.infer<typeof NewOrgsSchema>;
