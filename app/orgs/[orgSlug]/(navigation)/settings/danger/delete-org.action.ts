"use server";

import { auth } from "@/lib/auth/helper";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/mail/resend";
import OrgConfirmDeletionEmail from "@/emails/OrgConfirmDeletion.email";
import { redirect } from "next/navigation";
import { OrganizationMembershipRole } from "@prisma/client";

export async function organizationDeleteAction(input: { orgSlug: string }) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, serverError: "Not authenticated" };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        organizations: {
          where: { 
            roles: { has: OrganizationMembershipRole.OWNER },
            organization: { slug: input.orgSlug }
          },
          include: { organization: true },
        },
      },
    });

    if (!user || !user.organizations[0]?.organization) {
      return { success: false, serverError: "No organization found" };
    }

    const org = user.organizations[0].organization;

    await prisma.organization.delete({
      where: { id: org.id },
    });

    await resend.emails.send({
      from: "noreply@nownownow.io",
      subject: `Your organization has been deleted (${org.slug})`,
      to: user.email,
      react: OrgConfirmDeletionEmail({
        org: org.name,
      }),
    });

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      serverError: error instanceof Error ? error.message : "Failed to delete organization" 
    };
  }
}
