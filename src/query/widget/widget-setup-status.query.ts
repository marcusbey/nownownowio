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
  // Using the Prisma client to query the Widget model
  const widget = await prisma.$transaction(async (tx) => {
    return tx.$queryRaw<{ id: string; createdAt: Date }[]>`
      SELECT id, "createdAt" FROM "Widget"
      WHERE "organizationId" = ${organizationId}
      ORDER BY "createdAt" DESC
      LIMIT 1
    `;
  });

  // Check if widget exists and return appropriate status
  const widgetExists = Array.isArray(widget) && widget.length > 0;
  
  return {
    isConfigured: widgetExists,
    lastGeneratedAt: widgetExists ? widget[0].createdAt : undefined
  };
}
