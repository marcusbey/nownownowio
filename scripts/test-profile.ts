import { PrismaClient, OrganizationMembershipRole } from '@prisma/client';
import { logger } from '../src/lib/logger';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

async function cleanupTestData() {
  logger.info('🧹 Cleaning up test data...');
  await prisma.verificationToken.deleteMany({
    where: {
      identifier: { startsWith: 'test-' }
    }
  });
  await prisma.organizationMembership.deleteMany({
    where: {
      organization: {
        slug: { startsWith: 'test-org-' }
      }
    }
  });
  await prisma.organization.deleteMany({
    where: {
      slug: { startsWith: 'test-org-' }
    }
  });
  await prisma.user.deleteMany({
    where: {
      email: { endsWith: '@test.com' }
    }
  });
  logger.info('✨ Test data cleanup complete');
}

async function testUserProfile() {
  // Create test user
  const userId = `test-user-${uuidv4()}`;
  const email = `${userId}@test.com`;
  const password = await bcrypt.hash('testpass123', 10);
  
  const user = await prisma.user.create({
    data: {
      id: userId,
      email,
      name: 'Test User',
      displayName: 'Test Display Name',
      bio: 'Initial bio',
      websiteUrl: 'https://initial-website.com',
      passwordHash: password,
      emailVerified: new Date(),
    }
  });

  // Test profile update
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      displayName: 'Updated Display Name',
      bio: 'Updated bio',
      websiteUrl: 'https://updated-website.com',
    }
  });

  // Test widget token generation
  const widgetUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      widgetToken: nanoid(32)
    }
  });

  logger.info('✅ User Profile', {
    details: {
      userId: user.id,
      initialProfile: {
        displayName: user.displayName,
        bio: user.bio,
        websiteUrl: user.websiteUrl,
      },
      updatedProfile: {
        displayName: updatedUser.displayName,
        bio: updatedUser.bio,
        websiteUrl: updatedUser.websiteUrl,
      },
      widgetToken: widgetUser.widgetToken
    }
  });

  return user;
}

async function testOrganizationSettings(userId: string) {
  // Create test organization
  const orgSlug = `test-org-${uuidv4()}`;
  const org = await prisma.organization.create({
    data: {
      slug: orgSlug,
      name: 'Test Organization',
      email: 'org@test.com',
      websiteUrl: 'https://initial-org-website.com',
      members: {
        create: {
          userId,
          roles: [OrganizationMembershipRole.OWNER]
        }
      }
    }
  });

  // Test organization update
  const updatedOrg = await prisma.organization.update({
    where: { id: org.id },
    data: {
      name: 'Updated Organization',
      email: 'updated-org@test.com',
      websiteUrl: 'https://updated-org-website.com',
    }
  });

  logger.info('✅ Organization Settings', {
    details: {
      orgId: org.id,
      initialSettings: {
        name: org.name,
        email: org.email,
        websiteUrl: org.websiteUrl,
      },
      updatedSettings: {
        name: updatedOrg.name,
        email: updatedOrg.email,
        websiteUrl: updatedOrg.websiteUrl,
      }
    }
  });

  return org;
}

async function testInvitations(org: { id: string, slug: string }) {
  // Create invitation token
  const inviteeEmail = `test-invitee-${uuidv4()}@test.com`;
  const token = nanoid(32);
  
  const invitation = await prisma.verificationToken.create({
    data: {
      identifier: `test-${org.id}`,
      token,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    }
  });

  // Create invitee user
  const invitee = await prisma.user.create({
    data: {
      id: `test-invitee-${uuidv4()}`,
      email: inviteeEmail,
      name: 'Test Invitee',
      emailVerified: new Date(),
    }
  });

  // Accept invitation by creating membership
  const membership = await prisma.organizationMembership.create({
    data: {
      organizationId: org.id,
      userId: invitee.id,
      roles: [OrganizationMembershipRole.MEMBER]
    }
  });

  // Delete the used token
  await prisma.verificationToken.delete({
    where: { token: invitation.token }
  });

  logger.info('✅ Organization Invitations', {
    details: {
      orgId: org.id,
      inviteeEmail,
      invitationToken: token,
      membershipCreated: !!membership
    }
  });

  return invitee;
}

async function testBillingSettings(org: { id: string }) {
  // Test updating stripe customer ID
  const updatedOrg = await prisma.organization.update({
    where: { id: org.id },
    data: {
      stripeCustomerId: `test_cus_${nanoid(24)}`,
    }
  });

  logger.info('✅ Billing Settings', {
    details: {
      orgId: org.id,
      stripeCustomerId: updatedOrg.stripeCustomerId,
      planId: updatedOrg.planId
    }
  });

  return updatedOrg;
}

async function main() {
  logger.info('Starting Profile and Settings Tests...');
  
  try {
    await cleanupTestData();

    // Test user profile functionality
    const user = await testUserProfile();

    // Test organization settings functionality
    const org = await testOrganizationSettings(user.id);

    // Test organization invitations
    const invitee = await testInvitations(org);

    // Test billing settings
    await testBillingSettings(org);

    logger.info('✨ All tests completed successfully!');
  } catch (error) {
    logger.error('Error running tests:', error);
    process.exit(1);
  } finally {
    await cleanupTestData();
    logger.info('Shutting down Prisma client...');
    await prisma.$disconnect();
    logger.info('Prisma client disconnected successfully');
  }
}

main();
