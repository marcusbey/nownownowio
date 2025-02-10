import { PrismaClient } from "@prisma/client";
import { logger } from "./logger";

const isEdgeRuntime = () => process.env.NEXT_RUNTIME === 'edge';

const prismaClientSingleton = () => {
  if (isEdgeRuntime()) {
    return null;
  }

  return new PrismaClient({
    log: [
      { level: 'warn', emit: 'event' },
      { level: 'error', emit: 'event' },
    ],
  });
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

// Add event listeners for Prisma Client
if (prisma) {
  prisma.$on('error', (e) => {
    logger.error('[Database] Prisma Client error', {
      error: e.message,
      target: e.target,
    });
  });

  prisma.$on('warn', (e) => {
    logger.warn('[Database] Prisma Client warning', {
      message: e.message,
      target: e.target,
    });
  });
}

export { prisma };

// Re-export types
export type * from '@prisma/client';
