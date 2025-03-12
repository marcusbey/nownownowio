import { PrismaClient } from "@prisma/client";

/**
 * This is a type-only import/export to ensure that the Prisma client type
 * is available for client components, but the actual client is never imported
 * on the client side.
 */
export type { PrismaClient } from "@prisma/client";

// Determine if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Import widget extensions type
import type { widgetExtensions } from "./prisma/prisma.widget.extends";

// Type for our singleton instance with extensions
type ExtendedPrismaClient = PrismaClient & {
  widget: typeof widgetExtensions;
};

// Create a function to initialize the base Prisma client without extensions
function createPrismaClient() {
  // Only create the client on the server side
  if (isBrowser) {
    throw new Error(
      "PrismaClient cannot be used in browser environments. You're seeing this error because " +
      "you're trying to use Prisma Client in a client-side component. " +
      "Please use API routes or server components to access your database."
    );
  }

  // Check for Edge runtime
  const isEdgeRuntime = process.env.NEXT_RUNTIME === 'edge';
  if (isEdgeRuntime) {
    throw new Error(
      "Prisma Client cannot be used in Edge Runtime. You're seeing this error because you're trying " +
      "to use Prisma Client in a middleware or API route that's configured to use Edge Runtime. " +
      "Please use a traditional Node.js API route by adding 'export const runtime = \"nodejs\";' to your route file."
    );
  }

  return new PrismaClient();
}

// For singleton pattern in development to prevent multiple instances
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  extendedPrisma: ExtendedPrismaClient | undefined;
};

// Create or reuse the base Prisma client
const basePrisma = globalForPrisma.prisma ?? createPrismaClient();

// Export the Prisma client singleton (will be extended later)
export const prisma = basePrisma as unknown as ExtendedPrismaClient;

// In development, attach to global to prevent multiple instances
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = basePrisma;
}

// Apply extensions after initialization to avoid circular dependencies
export async function applyPrismaExtensions() {
  // This will be called after all modules are loaded
  // Import extensions dynamically when needed using ESM dynamic imports
  const orgExtends = await import("./prisma/prisma.org.extends");
  const userExtends = await import("./prisma/prisma.user.extends");
  const widgetExtends = await import("./prisma/prisma.widget.extends");
  
  // Create extended client with all extensions
  const extended = basePrisma.$extends({
    query: {
      organization: {
        update: orgExtends.onOrganizationUpdate,
      },
      user: {
        update: userExtends.onUserUpdate,
      },
    },
  }) as unknown as ExtendedPrismaClient;
  
  // Manually add the widget extensions
  extended.widget = widgetExtends.widgetExtensions;
  
  // Store in global for singleton pattern
  globalForPrisma.extendedPrisma = extended;
  
  // Copy all properties to the exported prisma client
  Object.assign(prisma, extended);
  
  return extended;
}
