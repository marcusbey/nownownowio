import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signUpAction } from '../signup.action';
import { prisma } from '@/lib/prisma';
import { getResendInstance } from '@/lib/mail/resend';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    verificationToken: {
      create: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('@/lib/mail/resend', () => ({
  getResendInstance: vi.fn(),
}));

describe('Email Verification Flow', () => {
  const mockUser = {
    email: 'test@example.com',
    name: 'Test User',
    password: 'TestPass123',
  };

  const mockVerificationToken = {
    identifier: mockUser.email,
    token: 'mock-token',
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create unverified user with verification token', async () => {
    // Mock user creation
    (prisma.user.create as any).mockResolvedValue({
      id: '1',
      email: mockUser.email,
      emailVerified: null,
    });

    // Mock token creation
    (prisma.verificationToken.create as any).mockResolvedValue(mockVerificationToken);

    // Mock Resend email service
    const mockResend = {
      emails: {
        send: vi.fn().mockResolvedValue({ id: 'mock-email-id' }),
      },
    };
    (getResendInstance as any).mockResolvedValue(mockResend);

    await signUpAction({ parsedInput: mockUser });

    // Verify user was created with emailVerified as null
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: mockUser.email,
          emailVerified: null,
        }),
      })
    );

    // Verify verification token was created
    expect(prisma.verificationToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          identifier: mockUser.email,
        }),
      })
    );

    // Verify email was sent
    expect(mockResend.emails.send).toHaveBeenCalled();
  });

  it('should handle resend email failure gracefully', async () => {
    // Mock user and token creation success
    (prisma.user.create as any).mockResolvedValue({
      id: '1',
      email: mockUser.email,
      emailVerified: null,
    });
    (prisma.verificationToken.create as any).mockResolvedValue(mockVerificationToken);

    // Mock Resend email service failure
    const mockResend = {
      emails: {
        send: vi.fn().mockRejectedValue(new Error('Email sending failed')),
      },
    };
    (getResendInstance as any).mockResolvedValue(mockResend);

    await expect(signUpAction({ parsedInput: mockUser }))
      .rejects
      .toThrow('Failed to send verification email');
  });
});
