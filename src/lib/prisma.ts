import { PrismaClient } from "@prisma/client";
import { onOrganizationUpdate } from "./prisma/prisma.org.extends";
import { onUserUpdate } from "./prisma/prisma.user.extends";

// This flag determines if we're in a Node.js or Edge environment
const isEdgeRuntime = process.env.NEXT_RUNTIME === 'edge';

// Create a regular Prisma client for Node.js environments
const prismaClientSingleton = () => {
  // Check for Edge runtime first and throw a helpful error
  if (isEdgeRuntime) {
    throw new Error(
      "Prisma Client cannot be used in Edge Runtime. You're seeing this error because you're trying " +
      "to use Prisma Client in a middleware or API route that's configured to use Edge Runtime. " +
      "Please use a traditional Node.js API route by adding 'export const runtime = \"nodejs\";' to your route file."
    );
  }

  return new PrismaClient().$extends({
    query: {
      organization: {
        update: onOrganizationUpdate,
      },
      user: {
        update: onUserUpdate,
      },
    },
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

// Export the regular Prisma client for Node.js environments
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// For Edge Runtime, export a dummy prisma client that can be safely imported
// but will throw a clear error if actually used
export const createEdgePrismaClient = () => {
  return new Proxy({} as PrismaClientSingleton, {
    get(target, prop) {
      if (prop === 'then') {
        return undefined; // For await expressions to work
      }

      // If someone tries to use this client, throw a helpful error
      throw new Error(
        "Prisma Client cannot be used in Edge Runtime. You're seeing this error because you're trying " +
        "to use Prisma Client in a middleware or API route that's configured to use Edge Runtime. " +
        "Please use a traditional Node.js API route by adding 'export const runtime = \"nodejs\";' to your route file."
      );
    },
  });
};
