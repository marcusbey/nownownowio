import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { randomUUID } from 'crypto';

export interface TestUser {
  id: string;
  email: string;
  password: string;
  name?: string;
}

export class AuthTestHelper {
  static async createTestUser(options: Partial<TestUser> = {}): Promise<TestUser> {
    const email = options.email || `test-${randomUUID()}@example.com`;
    const password = options.password || 'Test123!@#';
    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name: options.name || `Test User ${randomUUID()}`,
        passwordHash: hashedPassword,
      },
    });

    return {
      id: user.id,
      email,
      password,
      name: user.name || undefined,
    };
  }

  static async cleanupTestUser(email: string) {
    await prisma.user.deleteMany({
      where: { email },
    });
  }

  static async createVerificationToken(identifier: string, type: string, expiresIn = 24 * 60 * 60 * 1000) {
    const token = randomUUID();
    const expires = new Date(Date.now() + expiresIn);

    await prisma.verificationToken.create({
      data: {
        identifier,
        token,
        expires,
        type,
      },
    });

    return token;
  }

  static async findVerificationToken(identifier: string, type: string) {
    return prisma.verificationToken.findFirst({
      where: {
        identifier,
        type,
      },
    });
  }
}
