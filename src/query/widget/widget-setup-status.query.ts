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

  // Find the most recent widget for this organization
  // Using the Widget model from Prisma schema
  const widget = await prisma.$queryRaw`
    SELECT * FROM "Widget"
    WHERE "organizationId" = ${organizationId}
    ORDER BY "createdAt" DESC
    LIMIT 1
  `;

  return {
    isConfigured: !!widget && Array.isArray(widget) && widget.length > 0,
    lastGeneratedAt: Array.isArray(widget) && widget.length > 0 ? widget[0].createdAt : null
  };
}
