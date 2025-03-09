import { RESERVED_SLUGS } from "@/lib/organizations/reserved-slugs";
import { z } from "zod";
import { formatId } from "@/lib/format/id";

export const NewOrgsSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  websiteUrl: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional().or(z.literal('')),
  planId: z.string().default("FREE"),
}).transform((data) => {
  // Auto-generate slug and email from name
  const slug = formatId(data.name);
  
  // Ensure slug doesn't use reserved names
  if (RESERVED_SLUGS.includes(slug)) {
    throw new Error("This organization name results in a reserved slug");
  }
  
  return {
    name: data.name,
    slug: slug,
    email: `admin@${slug}.com`, // Default email based on slug
    websiteUrl: data.websiteUrl ?? undefined,
    bio: data.bio ?? undefined,
    planId: data.planId,
  };
});

export type NewOrganizationSchemaType = z.infer<typeof NewOrgsSchema>;
