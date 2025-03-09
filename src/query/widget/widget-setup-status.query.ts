import { prisma } from "@/lib/prisma";

export type WidgetSetupStatus = {
  isConfigured: boolean;
}

/**
 * Checks if the widget has been set up for an organization
 * @param organizationId The ID of the organization to check
 * @returns Object with isConfigured status
 */
export async function getWidgetSetupStatusQuery(
  organizationId: string
): Promise<WidgetSetupStatus> {
  // For now, we'll use a simpler approach to check if the widget is configured
  // In a real implementation, we would check for specific widget configuration
  
  // Verify that the organization exists
  await prisma.organization.findUniqueOrThrow({
    where: { id: organizationId }
  });

  // This is a placeholder logic - in a real implementation, we would check for actual widget configuration
  // For now, we'll assume the widget is not configured for any organization to show the banner
  return {
    isConfigured: false
  };
}
