import { AuthTestHelper } from '../helpers/auth.helper';
import { PerformanceHelper } from '../helpers/performance.helper';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

const perfHelper = new PerformanceHelper();

describe('Email Authentication', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'Test123!@#';

  afterEach(async () => {
    await AuthTestHelper.cleanupTestUser(testEmail);
    perfHelper.reset();
  });

  describe('Sign Up', () => {
    it('should successfully create a new user', async () => {
      perfHelper.start('email-signup');
      const hashedPassword = await hash(testPassword, 10);
      
      const user = await prisma.user.create({
        data: {
          email: testEmail,
          passwordHash: hashedPassword,
          name: 'Test User',
        },
      });
      perfHelper.end('email-signup');

      expect(user).toBeDefined();
      expect(user.email).toBe(testEmail);
      expect(user.passwordHash).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      // First signup
      await prisma.user.create({
        data: {
          email: testEmail,
          passwordHash: await hash(testPassword, 10),
          name: 'Test User',
        },
      });

      // Attempt duplicate signup
      await expect(prisma.user.create({
        data: {
          email: testEmail,
          passwordHash: await hash(testPassword, 10),
          name: 'Test User 2',
        },
      })).rejects.toThrow();
    });
  });

  describe('Password Validation', () => {
    it('should validate password requirements', async () => {
      const requirements = {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
      };

      const validatePassword = (password: string) => {
        const hasMinLength = password.length >= requirements.minLength;
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumbers = /[0-9]/.test(password);
        const hasSpecialChars = /[!@#$%^&*]/.test(password);

        return (
          hasMinLength &&
          hasUppercase &&
          hasLowercase &&
          hasNumbers &&
          hasSpecialChars
        );
      };

      expect(validatePassword('short')).toBe(false);
      expect(validatePassword('nouppercase123!')).toBe(false);
      expect(validatePassword('NOLOWERCASE123!')).toBe(false);
      expect(validatePassword('NoNumbers!')).toBe(false);
      expect(validatePassword('NoSpecialChars123')).toBe(false);
      expect(validatePassword('ValidPass123!')).toBe(true);
    });
  });

  describe('Email Verification', () => {
    it('should handle email verification flow', async () => {
      // Create unverified user
      const user = await prisma.user.create({
        data: {
          email: testEmail,
          passwordHash: await hash(testPassword, 10),
          name: 'Test User',
        },
      });

      // Create verification token
      const token = await AuthTestHelper.createVerificationToken(
        testEmail,
        'email_verification',
        15 * 60 * 1000 // 15 minutes
      );

      // Verify token exists
      const foundToken = await AuthTestHelper.findVerificationToken(
        testEmail,
        'email_verification'
      );
      expect(foundToken).toBeDefined();
      expect(foundToken?.token).toBe(token);

      // Update user as verified
      const verifiedUser = await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });

      expect(verifiedUser.emailVerified).toBeDefined();
    });
  });
});
