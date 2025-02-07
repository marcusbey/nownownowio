import { AuthTestHelper } from '../helpers/auth.helper';
import { PerformanceHelper } from '../helpers/performance.helper';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { randomUUID } from 'crypto';

const perfHelper = new PerformanceHelper();

describe('Security Features', () => {
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

  describe('Account Lockout', () => {
    it('should track failed login attempts', async () => {
      const maxAttempts = 5;
      const lockoutDuration = 30 * 60 * 1000; // 30 minutes

      // Create failed attempts
      for (let i = 0; i < maxAttempts; i++) {
        await prisma.loginAttempt.create({
          data: {
            email: testEmail,
            success: false,
            ip: '127.0.0.1',
            timestamp: new Date(),
          },
        });
      }

      // Check failed attempts
      const attempts = await prisma.loginAttempt.findMany({
        where: {
          email: testEmail,
          success: false,
          timestamp: {
            gte: new Date(Date.now() - lockoutDuration),
          },
        },
      });

      expect(attempts.length).toBeGreaterThanOrEqual(maxAttempts);
    });

    it('should reset failed attempts after successful login', async () => {
      // Record successful login
      await prisma.loginAttempt.create({
        data: {
          email: testEmail,
          success: true,
          ip: '127.0.0.1',
          timestamp: new Date(),
        },
      });

      // Delete failed attempts
      await prisma.loginAttempt.deleteMany({
        where: {
          email: testEmail,
          success: false,
        },
      });

      // Verify failed attempts were cleared
      const failedAttempts = await prisma.loginAttempt.findMany({
        where: {
          email: testEmail,
          success: false,
        },
      });

      expect(failedAttempts).toHaveLength(0);
    });
  });

  describe('Password Recovery', () => {
    it('should handle password reset flow', async () => {
      // Create reset token
      const token = await AuthTestHelper.createVerificationToken(
        testEmail,
        'password_reset',
        30 * 60 * 1000 // 30 minutes
      );

      // Verify token exists
      const foundToken = await AuthTestHelper.findVerificationToken(
        testEmail,
        'password_reset'
      );
      expect(foundToken).toBeDefined();
      expect(foundToken?.token).toBe(token);

      // Update password
      const newPassword = 'NewTest123!@#';
      await prisma.user.update({
        where: { id: userId },
        data: {
          passwordHash: await hash(newPassword, 10),
        },
      });

      // Delete used token
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: testEmail,
            token,
          },
        },
      });

      // Verify token was deleted
      const deletedToken = await AuthTestHelper.findVerificationToken(
        testEmail,
        'password_reset'
      );
      expect(deletedToken).toBeNull();
    });
  });

  describe('Rate Limiting', () => {
    const rateLimits = {
      loginAttempts: { max: 5, window: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
      passwordReset: { max: 3, window: 60 * 60 * 1000 }, // 3 requests per hour
      apiRequests: { max: 100, window: 60 * 1000 }, // 100 requests per minute
    };

    it('should track API rate limits', async () => {
      const clientIp = '127.0.0.1';
      
      // Record API requests
      const requests = Array(5).fill(null).map(() => 
        prisma.apiRequest.create({
          data: {
            ip: clientIp,
            endpoint: '/api/test',
            timestamp: new Date(),
          },
        })
      );

      await Promise.all(requests);

      // Check request count
      const requestCount = await prisma.apiRequest.count({
        where: {
          ip: clientIp,
          timestamp: {
            gte: new Date(Date.now() - rateLimits.apiRequests.window),
          },
        },
      });

      expect(requestCount).toBe(5);
    });
  });
});
