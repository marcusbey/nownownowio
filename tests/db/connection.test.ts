import { prisma } from '@/lib/prisma';
import { PerformanceHelper } from '../helpers/performance.helper';

describe('Database Connection', () => {
  const perfHelper = new PerformanceHelper();

  beforeEach(() => {
    perfHelper.reset();
  });

  it('should connect to the database', async () => {
    perfHelper.start('db-connect');
    await prisma.$connect();
    perfHelper.end('db-connect');

    expect(true).toBe(true); // If we get here, connection was successful
  });

  it('should perform basic CRUD operations', async () => {
    const testUser = {
      email: `test-${Date.now()}@example.com`,
      name: 'Test User',
    };

    // Create
    perfHelper.start('db-create');
    const created = await prisma.user.create({
      data: testUser,
    });
    perfHelper.end('db-create');

    expect(created.email).toBe(testUser.email);

    // Read
    perfHelper.start('db-read');
    const found = await prisma.user.findUnique({
      where: { id: created.id },
    });
    perfHelper.end('db-read');

    expect(found).toBeDefined();
    expect(found?.email).toBe(testUser.email);

    // Update
    perfHelper.start('db-update');
    const updated = await prisma.user.update({
      where: { id: created.id },
      data: { name: 'Updated Name' },
    });
    perfHelper.end('db-update');

    expect(updated.name).toBe('Updated Name');

    // Delete
    perfHelper.start('db-delete');
    await prisma.user.delete({
      where: { id: created.id },
    });
    perfHelper.end('db-delete');

    const deleted = await prisma.user.findUnique({
      where: { id: created.id },
    });
    expect(deleted).toBeNull();
  });

  it('should handle concurrent connections', async () => {
    const numConnections = 5;
    const operations = Array(numConnections).fill(null).map(async () => {
      const client = new PrismaClient();
      await client.$connect();
      const result = await client.user.count();
      await client.$disconnect();
      return result;
    });

    perfHelper.start('concurrent-connections');
    await Promise.all(operations);
    perfHelper.end('concurrent-connections');
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
