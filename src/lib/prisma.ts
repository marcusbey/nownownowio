import { PrismaClient } from "@prisma/client";
import { onOrganizationUpdate } from "./prisma/prisma.org.extends";
import { onUserUpdate } from "./prisma/prisma.user.extends";

const isEdgeRuntime = () => {
  return process.env.NEXT_RUNTIME === 'edge';
};

const prismaClientSingleton = () => {
  if (isEdgeRuntime()) {
    throw new Error('PrismaClient is not supported in Edge Runtime');
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

export { prisma } from './prisma/connection-manager'

// Re-export types
export type * from '@prisma/client'
