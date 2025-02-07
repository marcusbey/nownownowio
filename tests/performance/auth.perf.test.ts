import { prisma } from '@/lib/prisma';
import { PerformanceHelper } from '../helpers/performance.helper';
import { AuthTestHelper } from '../helpers/auth.helper';
import { hash } from 'bcryptjs';

const perfHelper = new PerformanceHelper();

describe('Authentication Performance', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'Test123!@#';

  afterEach(async () => {
    await AuthTestHelper.cleanupTestUser(testEmail);
    perfHelper.reset();
  });

  describe('User Operations', () => {
    it('should measure user creation performance', async () => {
      perfHelper.start('user-creation');
      const hashedPassword = await hash(testPassword, 10);
      
      const user = await prisma.user.create({
        data: {
          email: testEmail,
          passwordHash: hashedPassword,
          name: 'Test User',
        },
      });
      
      perfHelper.end('user-creation');

      expect(user).toBeDefined();
      expect(perfHelper.getMetrics()).toHaveLength(1);
      
      const metrics = perfHelper.getSummary();
      expect(metrics['user-creation']).toBeDefined();
      expect(metrics['user-creation'].avgDuration).toBeLessThan(1000); // Should take less than 1s
    });

    it('should measure user query performance', async () => {
      // Create test user
      const user = await AuthTestHelper.createTestUser({ email: testEmail });

      // Measure query performance
      perfHelper.start('user-query');
      const foundUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          posts: true,
          comments: true,
          likes: true,
          bookmarks: true,
          followers: true,
          following: true,
        },
      });
      perfHelper.end('user-query');

      expect(foundUser).toBeDefined();
      
      const metrics = perfHelper.getSummary();
      expect(metrics['user-query']).toBeDefined();
      expect(metrics['user-query'].avgDuration).toBeLessThan(500); // Should take less than 500ms
    });
  });

  describe('Authentication Operations', () => {
    it('should measure login performance', async () => {
      // Create test user
      const hashedPassword = await hash(testPassword, 10);
      await AuthTestHelper.createTestUser({
        email: testEmail,
        passwordHash: hashedPassword,
      });

      // Measure login performance
      perfHelper.start('user-login');
      const user = await prisma.user.findUnique({
        where: { email: testEmail },
      });
      // Simulate password verification
      if (user) {
        await hash(testPassword, 10);
      }
      perfHelper.end('user-login');

      expect(user).toBeDefined();
      
      const metrics = perfHelper.getSummary();
      expect(metrics['user-login']).toBeDefined();
      expect(metrics['user-login'].avgDuration).toBeLessThan(1000); // Should take less than 1s
    });

    it('should measure session creation performance', async () => {
      const user = await AuthTestHelper.createTestUser({ email: testEmail });

      perfHelper.start('session-creation');
      const session = await prisma.session.create({
        data: {
          userId: user.id,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
          sessionToken: 'test-session-token',
        },
      });
      perfHelper.end('session-creation');

      expect(session).toBeDefined();
      
      const metrics = perfHelper.getSummary();
      expect(metrics['session-creation']).toBeDefined();
      expect(metrics['session-creation'].avgDuration).toBeLessThan(500); // Should take less than 500ms
    });
  });
});
