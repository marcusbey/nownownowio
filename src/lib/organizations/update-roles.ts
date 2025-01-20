import { prisma } from "../prisma";
import { OrganizationMembershipRole } from "@prisma/client";

export async function ensureOwnerHasAdminRole(organizationId: string, userId: string) {
  const membership = await prisma.organizationMembership.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId,
      },
    },
  });

  if (membership && membership.roles.includes("OWNER") && !membership.roles.includes("ADMIN")) {
    // Add ADMIN role if user is OWNER
    await prisma.organizationMembership.update({
      where: {
        id: membership.id,
      },
      data: {
        roles: [...membership.roles, "ADMIN"],
      },
    });
  }
}

export async function updateMembershipRoles(organizationId: string, roles: OrganizationMembershipRole[]) {
  // Get all memberships where user is OWNER but not ADMIN
  const memberships = await prisma.organizationMembership.findMany({
    where: {
      organizationId,
      roles: {
        hasSome: roles,
      },
    },
  });

  // Add ADMIN role to all OWNER memberships
  for (const membership of memberships) {
    await prisma.organizationMembership.update({
      where: {
        id: membership.id,
      },
      data: {
        roles: [...membership.roles, "ADMIN"],
      },
    });
  }
}
