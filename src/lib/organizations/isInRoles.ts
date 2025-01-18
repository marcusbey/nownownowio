import { OrganizationMembershipRole } from "@prisma/client";

/**
 *
 * @param userRoles User's roles
 * @param rolesNeeded Roles to check
 * @returns a boolean indicating if the user has at least one role in rolesNeeded
 */
export const isInRoles = (
  userRoles?: OrganizationMembershipRole[],
  rolesNeeded?: OrganizationMembershipRole[],
) => {
  if (!userRoles) return false;

  // Owner can access to everything
  if (userRoles.includes("OWNER")) return true;

  if (!rolesNeeded) return true;
  
  // Check if user has at least one of the needed roles
  return rolesNeeded.some((role) => userRoles.includes(role));
};
