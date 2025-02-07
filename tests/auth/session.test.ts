import { AuthTestHelper } from '../helpers/auth.helper';
import { PerformanceHelper } from '../helpers/performance.helper';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

const perfHelper = new PerformanceHelper();

interface Session {
  id: string;
  userId: string;
  expires: Date;
  sessionToken: string;
}

describe('Session Management', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  let userId: string;
  
  beforeEach(async () => {
    const user = await AuthTestHelper.createTestUser({ email: testEmail });
    userId = user.id;
  });

  afterEach(async () => {
    await AuthTestHelper.cleanupTestUser(testEmail);
    perfHelper.reset();
  });

  describe('Session Creation', () => {
    it('should create new session', async () => {
      perfHelper.start('create-session');
      
      const session = await prisma.session.create({
        data: {
          sessionToken: randomUUID(),
          userId,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      });
      
      perfHelper.end('create-session');

      expect(session).toBeDefined();
      expect(session.userId).toBe(userId);
      expect(session.expires.getTime()).toBeGreaterThan(Date.now());
    });

    it('should handle multiple active sessions', async () => {
      // Create multiple sessions
      const sessions = await Promise.all([
        prisma.session.create({
          data: {
            sessionToken: randomUUID(),
            userId,
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        }),
        prisma.session.create({
          data: {
            sessionToken: randomUUID(),
            userId,
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        }),
      ]);

      expect(sessions).toHaveLength(2);
      expect(sessions[0].userId).toBe(userId);
      expect(sessions[1].userId).toBe(userId);
    });
  });

  describe('Session Validation', () => {
    it('should handle expired sessions', async () => {
      // Create expired session
      const session = await prisma.session.create({
        data: {
          sessionToken: randomUUID(),
          userId,
          expires: new Date(Date.now() - 1000), // Already expired
        },
      });

      // Check if session is expired
      expect(session.expires.getTime()).toBeLessThan(Date.now());

      // Cleanup expired sessions
      await prisma.session.deleteMany({
        where: {
          expires: {
            lt: new Date(),
          },
        },
      });

      // Verify session was cleaned up
      const foundSession = await prisma.session.findUnique({
        where: { id: session.id },
      });
      expect(foundSession).toBeNull();
    });
  });

  describe('Session Cleanup', () => {
    it('should cleanup user sessions on logout', async () => {
      // Create session
      const session = await prisma.session.create({
        data: {
          sessionToken: randomUUID(),
          userId,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      // Simulate logout by deleting session
      await prisma.session.delete({
        where: { id: session.id },
      });

      // Verify session was deleted
      const foundSession = await prisma.session.findUnique({
        where: { id: session.id },
      });
      expect(foundSession).toBeNull();
    });
  });
});
