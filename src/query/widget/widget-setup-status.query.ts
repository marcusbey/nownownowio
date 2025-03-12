import { prisma } from "@/lib/prisma";

export type WidgetSetupStatus = {
  isConfigured: boolean;
  lastGeneratedAt?: Date;
}

/**
 * Checks if the widget has been set up for an organization
 * @param organizationId The ID of the organization to check
 * @returns Object with isConfigured status and last generation date if available
 */
export async function getWidgetSetupStatusQuery(
  organizationId: string
): Promise<WidgetSetupStatus> {
  // Verify that the organization exists
  await prisma.organization.findUniqueOrThrow({
    where: { id: organizationId }
  });

  // Make sure the Prisma extensions are applied
  const { applyPrismaExtensions } = await import("@/lib/prisma");
  await applyPrismaExtensions();

  // Use the Prisma extension to get widget setup status
  // This avoids SQL injection and provides proper type safety
  return prisma.widget.getWidgetSetupStatus(organizationId);
}
