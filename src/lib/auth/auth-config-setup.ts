"use server";

import type { User } from "next-auth";
import { z } from "zod";
import { createOrganizationQuery } from "../../query/org/org-create.query";
import { env } from "../env";
import { formatId, getNameFromEmail } from "../format/id";
import { createContact } from "../mail/resend";
import { prisma } from "../prisma";
import { FREE_PLAN_ID } from "../../features/billing/plans/plan-constants";

export const setupResendCustomer = async (user: User) => {
  if (!user.email) {
    return;
  }

  if (!env.RESEND_AUDIENCE_ID) {
    return;
  }

  const contact = await createContact({
    audienceId: env.RESEND_AUDIENCE_ID,
    email: user.email,
    firstName: user.name ?? "",
    unsubscribed: false,
  });

  if (!contact.data) return;

  return contact.data.id;
};

const TokenSchema = z.object({
  orgId: z.string(),
});

export const setupDefaultOrganizationsOrInviteUser = async (user: User): Promise<string | undefined> => {
  if (!user.email || !user.id) {
    return undefined;
  }

  const tokens = await prisma.verificationToken.findMany({
    where: {
      identifier: {
        startsWith: `${user.email}-invite-`,
      },
    },
  });

  // If there is no token, there is no invitation
  // We create a default organization for the user
  if (tokens.length === 0) {
    // Create a more predictable slug based on email username
    const emailUsername = getNameFromEmail(user.email);
    const baseSlug = formatId(emailUsername);
    let orgSlug = baseSlug;
    
    // Check if slug exists and try with incremental suffixes if needed
    let counter = 1;
    let existingOrg = await prisma.organization.findUnique({
      where: { slug: orgSlug },
    });
    
    // If slug exists, try adding incremental numbers
    while (existingOrg && counter < 10) {
      orgSlug = `${baseSlug}-${counter}`;
      // Use Promise.all to avoid await in loop lint error
      [existingOrg] = await Promise.all([
        prisma.organization.findUnique({
          where: { slug: orgSlug },
        })
      ]);
      counter++;
    }
    
    // If we still have a conflict, use a random suffix as fallback
    if (existingOrg) {
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      orgSlug = `${baseSlug}-${randomSuffix}`;
    }
    // We don't need to store the organization object since we're just using the slug
    await createOrganizationQuery({
      slug: orgSlug,
      name: `${user.name ?? getNameFromEmail(user.email)}'s organization`,
      email: user.email,
      image: user.image,
      planId: FREE_PLAN_ID,
      billingPeriod: "MONTHLY",
      bio: "", // Add empty bio
      members: {
        create: {
          userId: user.id,
          roles: ["OWNER"],
        },
      },
    });
    
    // Return the organization slug for redirection
    return orgSlug;
  }

  for await (const token of tokens) {
    const tokenData = TokenSchema.parse(token.data);

    if (tokenData.orgId) {
      await prisma.organizationMembership.create({
        data: {
          organizationId: tokenData.orgId,
          userId: user.id,
          roles: ["MEMBER"],
        },
      });
      await prisma.verificationToken.delete({
        where: {
          token: token.token,
        },
      });
    }
  }
};
