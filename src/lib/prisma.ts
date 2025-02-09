import { PrismaClient } from "@prisma/client";

const isEdgeRuntime = () => process.env.NEXT_RUNTIME === 'edge';

const prismaClientSingleton = () => {
  // Return null for Edge Runtime to allow fallback handling
  if (isEdgeRuntime()) {
    return null;
  }
  return new PrismaClient();
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (prisma === null) {
  throw new Error('Database operations are not supported in this environment. Please use Server Components or API Routes.');
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export { prisma };

// Re-export types
export type * from '@prisma/client';
