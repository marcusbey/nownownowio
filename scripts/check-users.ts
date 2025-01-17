import { PrismaClient } from '@prisma/client';
import { logger } from '../src/lib/logger';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    // Get all users with their related data
    const users = await prisma.user.findMany({
      include: {
        accounts: true,
        organizations: {
          include: {
            organization: true
          }
        },
        posts: true,
      }
    });

    // Group users by email
    const usersByEmail = users.reduce((acc, user) => {
      if (!user.email) return acc;
      if (!acc[user.email]) acc[user.email] = [];
      acc[user.email].push(user);
      return acc;
    }, {} as Record<string, typeof users>);

    // Log information about each group of users
    for (const [email, users] of Object.entries(usersByEmail)) {
      logger.info(`\nEmail: ${email}`);
      for (const user of users) {
        logger.info(`User ID: ${user.id}`, {
          name: user.name,
          postsCount: user.posts.length,
          organizations: user.organizations.map(org => ({
            orgId: org.organizationId,
            orgName: org.organization.name,
            roles: org.roles
          })),
          authProviders: user.accounts.map(acc => acc.provider)
        });
      }
    }

  } catch (error) {
    logger.error('Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkUsers()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Check failed:', error);
    process.exit(1);
  });
