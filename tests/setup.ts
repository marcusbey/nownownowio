import { PrismaClient } from '@prisma/client';
import { logger } from '../src/lib/logger';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Connect to the database
  await prisma.$connect();
});

afterAll(async () => {
  // Disconnect from the database
  await prisma.$disconnect();
});

// Global test timeout
jest.setTimeout(30000);

// Silence logger during tests unless explicitly enabled
logger.silent = process.env.DEBUG !== 'true';
