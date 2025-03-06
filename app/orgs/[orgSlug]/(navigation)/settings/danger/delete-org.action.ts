"use server";

import { auth } from "@/lib/auth/helper";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mail/resend";
import OrgConfirmDeletionEmail from "@/emails/org-confirm-deletion.email";
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
    }) as { email: string; organizations: Array<{ organization: { id: string; name: string; slug: string } }> } | null;

    if (!user || !user.organizations[0]?.organization) {
      return { success: false, serverError: "No organization found" };
    }

    const org = user.organizations[0].organization;

    await prisma.organization.delete({
      where: { id: org.id },
    });

    await sendEmail({
      from: "noreply@nownownow.io",
      subject: `Your organization has been deleted (${org.slug})`,
      to: user.email,
      react: OrgConfirmDeletionEmail({
        org: org.name,
      }),
    });

    return { success: true };
  } catch (error) {
    return { success: false, serverError: String(error) };
  }
}
