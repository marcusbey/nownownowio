import type { User } from "next-auth";
import { z } from "zod";
import { createOrganizationQuery } from "../../query/org/org-create.query";
import { env } from "../env";
import { getNameFromEmail, getSlugFromUser } from "../format/id";
import { resend } from "../mail/resend";
import { prisma } from "../prisma";

export const setupResendCustomer = async (user: User) => {
  if (!user.email) {
    return;
  }

  if (!env.RESEND_AUDIENCE_ID) {
    return;
  }

  const contact = await resend.contacts.create({
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

export const setupDefaultOrganizationsOrInviteUser = async (user: User) => {
  if (!user.email || !user.id) {
    return;
  }

  const tokens = await prisma.verificationToken.findMany({
    where: {
      identifier: {
        startsWith: `${user.email}-invite-`,
      },
    },
  });

  // If there is no token and no existing organizations, create a default organization
  const existingOrgs = await prisma.organizationMembership.count({
    where: {
      userId: user.id,
    },
  });

  if (tokens.length === 0 && existingOrgs === 0) {
    const orgSlug = getSlugFromUser(user);
    await createOrganizationQuery({
      slug: orgSlug,
      name: `${user.name || getNameFromEmail(user.email)}'s organization`,
      email: user.email,
      image: user.image,
      members: {
        create: {
          userId: user.id,
          roles: ["OWNER"],
        },
      },
    });
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
