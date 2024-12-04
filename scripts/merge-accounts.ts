import { PrismaClient } from '@prisma/client';
import { logger } from '../src/lib/logger';

const prisma = new PrismaClient();

async function mergeAccounts() {
  try {
    // 1. Find all users with the same email
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

    // Process each group of users with the same email
    for (const [email, duplicateUsers] of Object.entries(usersByEmail)) {
      if (duplicateUsers.length <= 1) continue;

      logger.info(`Processing duplicate accounts for email: ${email}`);

      // Find the primary user (the one with most posts or first created)
      const primaryUser = duplicateUsers.reduce((prev, current) => {
        if (prev.posts.length > current.posts.length) return prev;
        if (prev.posts.length === current.posts.length && prev.createdAt < current.createdAt) return prev;
        return current;
      });

      // Get secondary users (the ones to merge into primary)
      const secondaryUsers = duplicateUsers.filter(u => u.id !== primaryUser.id);

      for (const secondaryUser of secondaryUsers) {
        logger.info(`Merging user ${secondaryUser.id} into ${primaryUser.id}`);

        // 1. Move all posts to primary user
        await prisma.post.updateMany({
          where: { authorId: secondaryUser.id },
          data: { authorId: primaryUser.id }
        });

        // 2. Move all accounts (OAuth connections) to primary user
        await prisma.account.updateMany({
          where: { userId: secondaryUser.id },
          data: { userId: primaryUser.id }
        });

        // 3. Handle organization memberships
        for (const orgMember of secondaryUser.organizations) {
          const primaryUserInOrg = primaryUser.organizations.find(
            po => po.organizationId === orgMember.organizationId
          );

          if (!primaryUserInOrg) {
            // Move organization membership to primary user
            await prisma.organizationMember.update({
              where: {
                userId_organizationId: {
                  userId: secondaryUser.id,
                  organizationId: orgMember.organizationId
                }
              },
              data: { userId: primaryUser.id }
            });
          } else {
            // Delete duplicate membership
            await prisma.organizationMember.delete({
              where: {
                userId_organizationId: {
                  userId: secondaryUser.id,
                  organizationId: orgMember.organizationId
                }
              }
            });
          }
        }

        // 4. Update primary user profile if needed
        await prisma.user.update({
          where: { id: primaryUser.id },
          data: {
            name: primaryUser.name || secondaryUser.name,
            image: primaryUser.image || secondaryUser.image,
          }
        });

        // 5. Delete the secondary user
        await prisma.user.delete({
          where: { id: secondaryUser.id }
        });

        logger.info(`Successfully merged user ${secondaryUser.id} into ${primaryUser.id}`);
      }
    }

    logger.info('Account merge completed successfully');
  } catch (error) {
    logger.error('Error merging accounts:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
mergeAccounts()
  .then(() => {
    logger.info('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Migration failed:', error);
    process.exit(1);
  });
