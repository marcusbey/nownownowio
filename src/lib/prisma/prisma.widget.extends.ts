import type { PrismaClient } from "@prisma/client";

// Define Widget type based on the Prisma schema
type Widget = {
  id: string;
  organizationId: string;
  widgetToken: string;
  settings?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};
import type { WidgetSetupStatus } from "@/query/widget/widget-setup-status.query";

// Get a fresh PrismaClient instance when needed
let localPrismaClient: PrismaClient | null = null;

async function getPrismaClient(): Promise<PrismaClient> {
  if (!localPrismaClient) {
    // Dynamically import to avoid circular dependency
    const { prisma } = await import("../prisma");
    localPrismaClient = prisma;
  }
  return localPrismaClient;
}

/**
 * Extension for Widget model to add custom methods
 */
export const widgetExtensions = {
  /**
   * Find the most recent widget for an organization
   */
  async findLatestForOrganization(organizationId: string): Promise<Widget | null> {
    const prisma = await getPrismaClient();
    
    // Use raw query since Widget model might not be recognized by TypeScript
    const widgets = await prisma.$queryRaw<Widget[]>`
      SELECT * FROM "Widget"
      WHERE "organizationId" = ${organizationId}
      ORDER BY "createdAt" DESC
      LIMIT 1
    `;
    
    return widgets.length > 0 ? widgets[0] : null;
  },
  
  /**
   * Check if a widget is configured for an organization
   */
  async getWidgetSetupStatus(organizationId: string): Promise<WidgetSetupStatus> {
    const prisma = await getPrismaClient();
    
    // Use raw query since Widget model might not be recognized by TypeScript
    const widgets = await prisma.$queryRaw<{ id: string; createdAt: Date }[]>`
      SELECT id, "createdAt" FROM "Widget"
      WHERE "organizationId" = ${organizationId}
      ORDER BY "createdAt" DESC
      LIMIT 1
    `;
    
    const widgetExists = widgets.length > 0;
    
    return {
      isConfigured: widgetExists,
      lastGeneratedAt: widgetExists ? widgets[0].createdAt : undefined
    };
  },

  /**
   * Create a new widget for an organization
   */
  async create(data: { organizationId: string; widgetToken: string; settings?: Record<string, unknown> }): Promise<Widget> {
    const prisma = await getPrismaClient();
    
    // Use raw query since Widget model might not be recognized by TypeScript
    await prisma.$executeRaw`
      INSERT INTO "Widget" ("id", "organizationId", "widgetToken", "settings", "createdAt", "updatedAt")
      VALUES (nanoid(11), ${data.organizationId}, ${data.widgetToken}, ${data.settings ? JSON.stringify(data.settings) : null}::jsonb, NOW(), NOW())
    `;
    
    // Fetch the created widget
    const widgets = await prisma.$queryRaw<Widget[]>`
      SELECT * FROM "Widget"
      WHERE "organizationId" = ${data.organizationId}
      ORDER BY "createdAt" DESC
      LIMIT 1
    `;
    
    if (!widgets.length) {
      throw new Error('Failed to create widget');
    }
    
    return widgets[0];
  }
};
