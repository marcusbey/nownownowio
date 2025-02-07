import { PrismaClient } from "@prisma/client";

const isEdgeRuntime = () => {
  return process.env.NEXT_RUNTIME === 'edge';
};

const prismaClientSingleton = () => {
  if (isEdgeRuntime()) {
    throw new Error('PrismaClient is not supported in Edge Runtime');
  }
  return new PrismaClient();
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export { prisma };

// Re-export types
export type * from '@prisma/client';
