"use server";

import MarkdownEmail from "@/emails/templates/Markdown.email";
import VerificationEmail from "@/emails/templates/VerificationEmails/VerificationEmails";
import { ActionError, orgAction } from "@/lib/actions/safe-actions";
import { sendEmail } from "@/lib/mail/sendEmail";
import { prisma } from "@/lib/prisma";
import { getOrgsMembers } from "@/query/org/get-orgs-members";
import { addHours } from "date-fns";
import { nanoid } from "nanoid";
import { } from "next/server";
import { CreateEmailResponse } from "resend";
import { z } from "zod";
import {
  OrgDangerFormSchema,
  OrgDetailsFormSchema,
  OrgMemberFormSchema,
} from "./org.schema";

export const updateOrganizationMemberAction = orgAction
  .metadata({
    roles: ["OWNER"],
  })
  .schema(OrgMemberFormSchema)
  .action(async ({ parsedInput: input, ctx }) => {
    const members = input.members.filter((member) => member.id !== ctx.user.id);

    const currentMembers = await prisma.organizationMembership.findMany({
      where: {
        organizationId: ctx.org.id,
      },
      select: {
        id: true,
        roles: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    const membersToDelete = currentMembers.filter(
      (member) =>
        !members.some((m) => m.id === member.id) &&
        !member.roles.includes("OWNER"),
    );

    const deletedMembers = prisma.organizationMembership.deleteMany({
      where: {
        organizationId: ctx.org.id,
        id: {
          in: membersToDelete.map((m) => m.id),
        },
      },
    });

    const promises: Promise<CreateEmailResponse>[] = [];

    for await (const member of membersToDelete) {
      promises.push(
        sendEmail({
          to: member.user.email,
          subject: `[${ctx.org.name}] You've been removed from the organization`,
          react: MarkdownEmail({
            preview: `You've been removed from the organization ${ctx.org.name}.`,
            markdown: `Hi,

You've been removed from the organization ${ctx.org.name}.

If you think it's a mistake, please contact organization's owner : ${ctx.org.email}

Best,
          `,
          }),
        }),
      );
    }

    const memberToUpdate = members.filter((member) => {
      const currentMember = currentMembers.find((m) => m.id === member.id);
      return currentMember && !currentMember.roles.includes("OWNER");
    });

    const updatedMembers = memberToUpdate.map((member) => {
      return prisma.organizationMembership.update({
        where: {
          organizationId: ctx.org.id,
          id: member.id,
        },
        data: {
          roles: member.roles,
        },
      });
    });

    await prisma.$transaction([deletedMembers, ...updatedMembers]);
    await Promise.all(promises);

    return { members: await getOrgsMembers(ctx.org.id) };
  });

export const updateOrganizationDetailsAction = orgAction
  .schema(z.union([OrgDetailsFormSchema, OrgDangerFormSchema]))
  .metadata({
    roles: ["OWNER"],
  })
  .action(async ({ parsedInput, ctx }) => {
    const updatedOrganization = await prisma.organization.update({
      where: {
        id: ctx.org.id,
      },
      data: parsedInput,
      include: {
        plan: true,
        members: {
          include: {
            user: true
          }
        }
      }
    });

    return updatedOrganization;
  });

export const inviteUserInOrganizationAction = orgAction
  .metadata({
    roles: ["OWNER", "ADMIN"],
  })
  .schema(
    z.object({
      email: z.string().email(),
    }),
  )
  .action(async ({ parsedInput: { email }, ctx }) => {
    try {
      // Check member limit
      const [currentMembers, pendingInvites] = await Promise.all([
        prisma.organizationMembership.count({
          where: { organizationId: ctx.org.id }
        }),
        prisma.verificationToken.count({
          where: {
            identifier: { startsWith: `${email}-invite-${ctx.org.id}` },
            expires: { gt: new Date() }
          }
        })
      ]);

      const plan = await prisma.organizationPlan.findUnique({
        where: { id: ctx.org.plan.id },
        select: { maximumMembers: true }
      });

      if (!plan) {
        throw new ActionError("Organization plan not found");
      }

      if (currentMembers + pendingInvites >= plan.maximumMembers) {
        throw new ActionError("Maximum member limit reached");
      }

      // Check if user is already a member
      const existingMember = await prisma.organizationMembership.findFirst({
        where: {
          organization: { id: ctx.org.id },
          user: { email },
        },
      });

      if (existingMember) {
        throw new ActionError("This user is already a member of the organization");
      }

      // Check for existing active invitation
      const existingToken = await prisma.verificationToken.findFirst({
        where: {
          identifier: `${email}-invite-${ctx.org.id}`,
          expires: {
            gt: new Date(),
          },
        },
      });

      if (existingToken) {
        throw new ActionError("This email already has a pending invitation");
      }

      // Create verification token for the link
      const INVITE_EXPIRATION_HOURS = 24;
      const verificationToken = await prisma.verificationToken.create({
        data: {
          identifier: `${email}-invite-${ctx.org.id}`,
          expires: addHours(new Date(), INVITE_EXPIRATION_HOURS),
          token: nanoid(32),
          data: {
            orgId: ctx.org.id,
            email,
            expiresIn: `${INVITE_EXPIRATION_HOURS} hours`,
          },
        },
      });

      // Send invitation email
      try {
        await sendEmail({
          to: email,
          subject: `Invitation to join ${ctx.org.name}`,
          react: VerificationEmail({
            type: "orgInvitation",
            data: {
              token: verificationToken.token,
              orgSlug: ctx.org.slug,
              organizationName: ctx.org.name,
              expiresIn: `${INVITE_EXPIRATION_HOURS} hours`,
            },
          }),
        });
      } catch (emailError) {
        // Clean up the token if email fails
        await prisma.verificationToken.delete({
          where: {
            identifier_token: {
              identifier: verificationToken.identifier,
              token: verificationToken.token
            }
          }
        });
        throw new ActionError("Failed to send invitation email. Please try again.");
      }

      return { success: true };
    } catch (error) {
      console.error("Invitation error:", error);
      if (error instanceof ActionError) {
        throw error;
      }
      throw new ActionError("Failed to send invitation. Please try again.");
    }
  });
