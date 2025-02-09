"use server";

import AccountEmail from "@/emails/templates/AccountEmails/AccountEmails";
import { ActionError, authAction } from "@/lib/actions/safe-actions";
import { sendEmail } from "@/lib/mail/sendEmail";
import { prisma } from "@/lib/prisma";
import { getServerUrl } from "@/lib/server-url";
import { deleteOrganizationQuery } from "@/query/org/org-delete.query";
import { addHours } from "date-fns";
import { nanoid } from "nanoid";
import { z } from "zod";

const TokenSchema = z.object({
  deleteAccount: z.boolean(),
});

async function verifyDeleteAccountToken(
  token: string,
  userEmail: string,
) {
  if (!prisma) {
    throw new Error('Database operations are not supported in this environment');
  }

  const verificationToken = await prisma.verificationToken.findUnique({
    where: {
      token,
    },
  });

  if (!verificationToken) {
    throw new ActionError("Invalid token");
  }

  const tokenData = TokenSchema.parse(String(verificationToken.data));

  if (!tokenData.deleteAccount) {
    throw new ActionError("Invalid token");
  }

  if (verificationToken.identifier !== `${userEmail}-delete-account`) {
    throw new ActionError("Invalid token");
  }

  if (verificationToken.expires < new Date()) {
    throw new ActionError("Token expired");
  }

  return verificationToken;
}

export const accountAskDeletionAction = authAction.action(async ({ ctx }) => {
  const userId = ctx.user.id;

  if (!prisma) {
    throw new Error('Database operations are not supported in this environment');
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      organizations: {
        where: {
          roles: {
            hasSome: ["OWNER"],
          },
        },
        select: {
          organization: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new ActionError("You are not logged in!");
  }

  const token = await prisma.verificationToken.create({
    data: {
      identifier: `${user.email}-delete-account`,
      expires: addHours(new Date(), 1),
      data: {
        deleteAccount: true,
      },
      token: nanoid(32),
      userId: user.id, // Add required userId field
    },
  });

  await sendEmail({
    subject: "[Action required] Confirm your account deletion",
    to: [user.email],
    react: AccountEmail({
      type: "askDeletion",
      data: {
        organizationsToDelete: user.organizations?.map(
          (o) => o.organization.name
        ),
        confirmUrl: `${getServerUrl()}/account/delete/confirm?token=${token.token}`
      }
    })
  });

  return { success: true };
});

export { verifyDeleteAccountToken };

export const orgConfirmDeletionAction = authAction
  .schema(
    z.object({
      token: z.string(),
    }),
  )
  .action(async ({ parsedInput: { token }, ctx }) => {
    await verifyDeleteAccountToken(token, ctx.user.email);

    if (!prisma) {
      throw new Error('Database operations are not supported in this environment');
    }

    // First delete all organizations linked to the user
    const organizationsToDelete = await prisma.organization.findMany({
      where: {
        members: {
          some: {
            userId: ctx.user.id,
            roles: {
              hasSome: ["OWNER"],
            },
          },
        },
      },
    });

    for await (const organization of organizationsToDelete) {
      await deleteOrganizationQuery(organization.id);
    }

    await prisma.user.delete({
      where: {
        id: ctx.user.id,
      },
    });

    await prisma.verificationToken.delete({
      where: {
        token,
      },
    });

    await sendEmail({
      subject: "Your account has been deleted",
      to: ctx.user.email,
      react: AccountEmail({ type: "confirmDeletion" }),
    });
  });
