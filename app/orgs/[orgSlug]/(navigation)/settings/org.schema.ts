import { RESERVED_SLUGS } from "@/lib/organizations/reservedSlugs";
import { OrganizationMembershipRole } from "@prisma/client";
import { z } from "zod";

/**
 * Warning
 * The schema here is used in settings.action.ts with `z.union`
 * You should never make all properties optional in a union schema
 * because `union` will always return the first schema that matches
 * So if you make all properties optional, the first schema will always match
 * and the second schema will never be used
 */
export const OrgDetailsFormSchema = z.object({
  name: z.string().min(2, {
    message: "Organization name must be at least 2 characters",
  }).max(50, {
    message: "Organization name must be less than 50 characters",
  }),
  email: z.union([
    z.string().email({
      message: "Please enter a valid email address",
    }), 
    z.string().length(0)
  ]).optional(),
  image: z.string().nullable().refine((val) => {
    if (!val) return true;
    try {
      const url = new URL(val);
      return url.protocol === 'https:' || url.protocol === 'http:';
    } catch {
      return false;
    }
  }, {
    message: "Please provide a valid image URL",
  }),
  bannerImage: z.string().nullable().refine((val) => {
    if (!val) return true;
    try {
      const url = new URL(val);
      return url.protocol === 'https:' || url.protocol === 'http:';
    } catch {
      return false;
    }
  }, {
    message: "Please provide a valid banner image URL",
  }),
  bio: z.string().max(500, {
    message: "Bio must be less than 500 characters",
  }).optional(),
  websiteUrl: z.union([
    z.string().url({
      message: "Please enter a valid URL starting with http:// or https://",
    }).refine((val) => {
      try {
        const url = new URL(val);
        return url.protocol === 'https:' || url.protocol === 'http:';
      } catch {
        return false;
      }
    }, {
      message: "URL must start with http:// or https://",
    }),
    z.string().length(0)
  ]).optional(),
});

export const OrgMemberFormSchema = z.object({
  members: z.array(
    z.object({
      id: z.string(),
      roles: z.array(z.nativeEnum(OrganizationMembershipRole)),
    }),
  ),
});

export const OrgDangerFormSchema = z.object({
  slug: z.string()
    .min(3, {
      message: "Slug must be at least 3 characters",
    })
    .max(50, {
      message: "Slug must be less than 50 characters",
    })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug can only contain lowercase letters, numbers, and hyphens",
    })
    .refine((v) => !RESERVED_SLUGS.includes(v), {
      message: "This organization slug is reserved",
    }),
});

export type OrgDetailsFormSchemaType = z.infer<typeof OrgDetailsFormSchema>;
export type OrgMemberFormSchemaType = z.infer<typeof OrgMemberFormSchema>;
export type OrgDangerFormSchemaType = z.infer<typeof OrgDangerFormSchema>;
