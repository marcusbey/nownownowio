"use server";

import { MarkdownEmail } from "@/emails/markdown.email";
import { OrganizationInvitationEmail } from "@/emails/organization-invitation-email.email";
import { ActionError, orgAction } from "@/lib/actions/safe-actions";
import { auth } from "@/lib/auth/helper";
import { sendEmail } from "@/lib/mail/sendEmail";
import { prisma } from "@/lib/prisma";
import { getOrgsMembers } from "@/query/org/get-orgs-members";
import { addHours } from "date-fns";
import { nanoid } from "nanoid";
import { } from "next/server";
import type { CreateEmailResponse } from "resend";
import { z } from "zod";
import {
  OrgDangerFormSchema,
  OrgDetailsFormSchema,
  OrgMemberFormSchema,
} from "./org.schema";

// Helper function to safely extract organization ID and other properties from context
function getOrgContext(ctx: Record<string, unknown>) {
  // Determine if org context is nested or flattened
  const isNestedContext = 'org' in ctx;

  // Type guard for nested context
  const getNestedValue = <T>(nestedKey: string, flatKey: string, defaultValue: T): T => {
    if (isNestedContext &&
      typeof ctx.org === 'object' &&
      ctx.org !== null &&
      nestedKey in (ctx.org as Record<string, unknown>)) {
      return (ctx.org as Record<string, unknown>)[nestedKey] as T;
    }

    if (flatKey in ctx) {
      return ctx[flatKey] as T;
    }

    return defaultValue;
  };

  // Helper to safely get plan ID
  const getPlanId = (): string => {
    if (isNestedContext &&
      typeof ctx.org === 'object' &&
      ctx.org !== null &&
      'plan' in (ctx.org as Record<string, unknown>) &&
      typeof (ctx.org as Record<string, unknown>).plan === 'object' &&
      (ctx.org as Record<string, unknown>).plan !== null &&
      'id' in ((ctx.org as Record<string, unknown>).plan as Record<string, unknown>)) {
      return ((ctx.org as Record<string, unknown>).plan as Record<string, unknown>).id as string;
    }

    if ('plan' in ctx &&
      typeof ctx.plan === 'object' &&
      ctx.plan !== null &&
      'id' in (ctx.plan as Record<string, unknown>)) {
      return (ctx.plan as Record<string, unknown>).id as string;
    }

    return '';
  };

  return {
    id: getNestedValue<string>('id', 'id', ''),
    name: getNestedValue<string>('name', 'name', ''),
    email: getNestedValue<string | null>('email', 'email', null),
    slug: getNestedValue<string>('slug', 'slug', ''),
    plan: {
      ...getNestedValue<Record<string, unknown>>('plan', 'plan', {}),
      id: getPlanId()
    },
    members: getNestedValue<Record<string, unknown>[]>('members', 'members', []),
  };
}

export const updateOrganizationMemberAction = orgAction
  .metadata({
    roles: ["OWNER"],
  })
  .schema(OrgMemberFormSchema)
  .action(async ({ parsedInput: input, ctx }) => {
    const orgContext = getOrgContext(ctx);
    // Check if the user ID is directly in ctx (new structure) or in ctx.user (old structure)
    const userId = 'user' in ctx &&
      typeof ctx.user === 'object' &&
      ctx.user !== null &&
      'id' in (ctx.user as Record<string, unknown>) ?
      String((ctx.user as Record<string, unknown>).id) :
      String(orgContext.members[0]?.userId || '');
    const members = input.members.filter((member) => member.id !== userId);

    const currentMembers = await prisma.organizationMembership.findMany({
      where: {
        organizationId: orgContext.id,
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
        organizationId: orgContext.id,
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
          subject: `[${orgContext.name}] You've been removed from the organization`,
          react: MarkdownEmail({
            preview: `You've been removed from the organization ${orgContext.name}.`,
            markdown: `Hi,

You've been removed from the organization ${orgContext.name}.

If you think it's a mistake, please contact organization's owner : ${orgContext.email}

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

    const updatedMembers = memberToUpdate.map(async (member) => {
      return prisma.organizationMembership.update({
        where: {
          organizationId: orgContext.id,
          id: member.id,
        },
        data: {
          roles: member.roles,
        },
      });
    });

    await Promise.allSettled([
      deletedMembers,
      ...updatedMembers.map(async p => p.catch(e => console.error("Member update error:", e)))
    ]);

    await Promise.all(promises);

    return { members: await getOrgsMembers(orgContext.id) };
  });

export const updateOrganizationDetailsAction = orgAction
  .schema(z.union([OrgDetailsFormSchema, OrgDangerFormSchema]))
  .metadata({
    roles: ["OWNER"],
  })
  .action(async ({ parsedInput, ctx }) => {
    try {
      // Check if we have an orgSlug in the input and use it to find the organization
      const orgSlug = 'orgSlug' in parsedInput && parsedInput.orgSlug ? parsedInput.orgSlug : null;

      console.log("⭐️ Action initiated with context:", {
        hasContext: !!ctx,
        contextType: typeof ctx,
        orgSlug: orgSlug ?? 'not provided',
        inputKeys: Object.keys(parsedInput)
      });

      let organization = null;

      // If we have an orgSlug in the input, try to use it directly
      if (orgSlug) {
        console.log("⭐️ Using orgSlug from input:", orgSlug);

        // Use the session to get the user ID
        const session = await auth();
        if (!session?.id) {
          console.error("⭐️ No user session found");
          throw new Error("You must be authenticated to update an organization");
        }

        console.log("⭐️ User authenticated:", {
          userId: session.id,
          userEmail: session.email
        });

        // Find the organization directly using the slug and user ID
        try {
          organization = await prisma.organization.findFirst({
            where: {
              slug: orgSlug,
              members: {
                some: {
                  userId: session.id,
                  roles: {
                    hasSome: ["OWNER"]
                  }
                }
              }
            },
            include: {
              plan: true,
              members: {
                include: {
                  user: true
                }
              }
            }
          });

          if (organization) {
            console.log("⭐️ Found organization:", {
              id: organization.id,
              name: organization.name,
              membersCount: organization.members.length
            });
          } else {
            // If organization is not found, try to diagnose why
            const orgExists = await prisma.organization.findUnique({
              where: { slug: orgSlug },
              select: { id: true, name: true }
            });

            if (orgExists) {
              console.error("⭐️ User not authorized for organization:", {
                userId: session.id,
                orgId: orgExists.id,
                orgName: orgExists.name
              });

              // Check if user has any membership
              const membership = await prisma.organizationMembership.findFirst({
                where: {
                  organizationId: orgExists.id,
                  userId: session.id
                }
              });

              if (membership) {
                console.error("⭐️ User has membership but not OWNER role");
                throw new Error("You must be an owner to update organization details");
              } else {
                console.error("⭐️ User has no membership for this organization");
                throw new Error("You are not a member of this organization");
              }
            } else {
              console.error("⭐️ Organization not found with slug:", orgSlug);
              throw new Error(`Organization not found with slug: ${orgSlug}`);
            }
          }
        } catch (findError) {
          console.error("⭐️ Error finding organization:", findError);
          if (findError instanceof Error) {
            throw findError;
          }
          throw new Error("Failed to find organization");
        }
      } else {
        console.log("⭐️ No orgSlug provided, falling back to context");
      }

      // Use helper function to extract org context consistently (fallback if we don't have an org yet)
      const orgContext = organization ? {
        id: organization.id,
        name: organization.name,
        email: organization.email,
        slug: organization.slug,
        plan: organization.plan,
        members: organization.members
      } : getOrgContext(ctx);

      // Debug the context structure
      console.log("⭐️ Context object:", JSON.stringify({
        hasCtx: !!ctx,
        ctxType: typeof ctx,
        hasOrgProperty: 'org' in ctx,
        context: orgContext,
        foundOrganizationDirectly: !!organization
      }));

      if (!orgContext.id) {
        console.error("⭐️ Missing organization ID in context");
        throw new Error("Unable to identify organization");
      }

      // Log the input for debugging
      console.log("⭐️ Updating organization with data:", {
        parsedInput: JSON.stringify(parsedInput),
        keys: Object.keys(parsedInput),
        hasImage: 'image' in parsedInput,
        imageValue: 'image' in parsedInput ? parsedInput.image : 'not present',
        imageValueLength: 'image' in parsedInput && parsedInput.image ? parsedInput.image.length : 0,
        hasBannerImage: 'bannerImage' in parsedInput,
        bannerImageValue: 'bannerImage' in parsedInput ? parsedInput.bannerImage : 'not present',
        bannerImageValueLength: 'bannerImage' in parsedInput && parsedInput.bannerImage ? parsedInput.bannerImage.length : 0,
        inputType: 'slug' in parsedInput ? 'danger form' : 'details form',
        organizationId: orgContext.id
      });

      // Prepare the update data with special handling for image fields
      const updateData: Record<string, unknown> = {};

      // Explicitly copy each field from parsedInput to updateData
      for (const [key, value] of Object.entries(parsedInput)) {
        updateData[key] = value;
      }

      // Special handling to ensure image fields are included and valid
      if ('image' in parsedInput) {
        // Make sure we're not passing undefined/null when the URL is empty
        if (!parsedInput.image) {
          console.log("⭐️ Setting image field to null (was empty)");
          updateData.image = null;
        } else {
          console.log("⭐️ Setting image field to URL:", parsedInput.image);
          // Store the raw URL without any transformation
          updateData.image = String(parsedInput.image).trim();
        }
      }

      if ('bannerImage' in parsedInput) {
        // Make sure we're not passing undefined/null when the URL is empty
        if (!parsedInput.bannerImage) {
          console.log("⭐️ Setting bannerImage field to null (was empty)");
          updateData.bannerImage = null;
        } else {
          console.log("⭐️ Setting bannerImage field to URL:", parsedInput.bannerImage);
          // Store the raw URL without any transformation
          updateData.bannerImage = String(parsedInput.bannerImage).trim();
        }
      }

      // Log the update data before database operation
      console.log("⭐️ Update data being sent to database:", JSON.stringify(updateData));

      try {
        // Get the current organization to compare changes
        const currentOrg = await prisma.organization.findUnique({
          where: { id: orgContext.id },
          select: {
            image: true,
            bannerImage: true,
            name: true,
            email: true
          }
        });

        if (!currentOrg) {
          console.error("⭐️ Organization not found with ID:", orgContext.id);
          throw new Error(`Organization not found with ID: ${orgContext.id}`);
        }

        console.log("⭐️ Current organization image data:", {
          currentImage: currentOrg.image,
          currentImageLength: currentOrg.image ? currentOrg.image.length : 0,
          currentBannerImage: currentOrg.bannerImage,
          currentBannerImageLength: currentOrg.bannerImage ? currentOrg.bannerImage.length : 0,
          currentName: currentOrg.name,
          currentEmail: currentOrg.email
        });

        // Perform the update
        try {
          console.log("⭐️ Attempting database update with data:", JSON.stringify(updateData));

          // Create a clean update data object without the orgSlug field
          // as it's not a column in the database table
          const cleanUpdateData = { ...updateData };

          // Remove fields that shouldn't be passed to Prisma
          if ('orgSlug' in cleanUpdateData) {
            delete cleanUpdateData.orgSlug;
          }

          console.log("⭐️ Clean update data after removing non-DB fields:",
            JSON.stringify(cleanUpdateData),
            "Keys:", Object.keys(cleanUpdateData)
          );

          // Safety check to ensure we have valid update data
          if (!cleanUpdateData || Object.keys(cleanUpdateData).length === 0) {
            console.warn("⭐️ No valid fields to update");

            // If there's nothing to update, just fetch the current org and return it
            const currentOrgDetails = await prisma.organization.findUnique({
              where: {
                id: orgContext.id,
              },
              include: {
                plan: true,
                members: {
                  include: {
                    user: true
                  }
                }
              }
            });

            if (!currentOrgDetails) {
              throw new Error("Organization not found");
            }

            return { data: currentOrgDetails };
          }

          // Ensure all image fields are strings or null, not undefined
          if ('image' in cleanUpdateData && cleanUpdateData.image === undefined) {
            cleanUpdateData.image = null;
          }

          if ('bannerImage' in cleanUpdateData && cleanUpdateData.bannerImage === undefined) {
            cleanUpdateData.bannerImage = null;
          }

          console.log("⭐️ Final update data being sent to database:",
            JSON.stringify(cleanUpdateData)
          );

          // Ensure update data is a valid object
          const updatedOrganization = await prisma.organization.update({
            where: {
              id: orgContext.id,
            },
            data: cleanUpdateData,
            include: {
              plan: true,
              members: {
                include: {
                  user: true
                }
              }
            }
          });

          // Log the result with explicit field checks
          console.log("⭐️ Organization updated successfully:", {
            id: updatedOrganization.id,
            name: updatedOrganization.name,
            hasImage: !!updatedOrganization.image,
            imageValue: updatedOrganization.image,
            imageValueLength: updatedOrganization.image ? updatedOrganization.image.length : 0,
            imageChanged: currentOrg.image !== updatedOrganization.image,
            hasBannerImage: !!updatedOrganization.bannerImage,
            bannerImageValue: updatedOrganization.bannerImage,
            bannerImageValueLength: updatedOrganization.bannerImage ? updatedOrganization.bannerImage.length : 0,
            bannerImageChanged: currentOrg.bannerImage !== updatedOrganization.bannerImage,
            updatedFields: Object.keys(updateData)
          });

          // Return with correct data structure that the client expects
          return { data: updatedOrganization };
        } catch (dbError) {
          console.error("⭐️ Database update error:", dbError);
          throw dbError;
        }
      } catch (error) {
        console.error("⭐️ Error updating organization:", error);
        throw error;
      }
    } catch (error) {
      console.error("⭐️ Error updating organization:", error);
      throw error;
    }
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
      const orgContext = getOrgContext(ctx);

      // Get the plan ID safely
      const planId = typeof orgContext.plan === 'object' &&
        'id' in orgContext.plan ?
        String(orgContext.plan.id) : '';

      // Check member limit
      const [currentMembers, pendingInvites] = await Promise.all([
        prisma.organizationMembership.count({
          where: { organizationId: orgContext.id }
        }),
        prisma.verificationToken.count({
          where: {
            identifier: { startsWith: `${email}-invite-${orgContext.id}` },
            expires: { gt: new Date() }
          }
        })
      ]);

      const plan = await prisma.organizationPlan.findUnique({
        where: { id: planId },
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
          organization: { id: orgContext.id },
          user: { email },
        },
      });

      if (existingMember) {
        throw new ActionError("This user is already a member of the organization");
      }

      // Check for existing active invitation
      const existingToken = await prisma.verificationToken.findFirst({
        where: {
          identifier: `${email}-invite-${orgContext.id}`,
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
          identifier: `${email}-invite-${orgContext.id}`,
          expires: addHours(new Date(), INVITE_EXPIRATION_HOURS),
          token: nanoid(32),
          data: {
            orgId: orgContext.id,
            email,
            expiresIn: `${INVITE_EXPIRATION_HOURS} hours`,
          },
        },
      });

      // Send invitation email
      try {
        await sendEmail({
          to: email,
          subject: `Invitation to join ${orgContext.name}`,
          react: OrganizationInvitationEmail({
            token: verificationToken.token,
            orgSlug: orgContext.slug,
            organizationName: orgContext.name,
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
