import { PrismaClient } from '@prisma/client';
import { logger } from '../src/lib/logger';

const prisma = new PrismaClient();

async function mergeMyAccounts() {
  try {
    // Find the Google account (primary)
    const googleAccount = await prisma.user.findUnique({
      where: { email: 'rboboe@gmail.com' },
      include: {
        accounts: true,
        organizations: {
          include: {
            organization: true
          }
        },
        posts: true
      }
    });

    // Find the Twitter account
    const twitterAccount = await prisma.user.findFirst({
      where: { email: { endsWith: '@twitter.placeholder.com' } },
      include: {
        accounts: true,
        organizations: {
          include: {
            organization: true
          }
        },
        posts: true
      }
    });

    if (!googleAccount || !twitterAccount) {
      logger.error('Could not find both accounts', {
        googleAccount: !!googleAccount,
        twitterAccount: !!twitterAccount
      });
      return;
    }

    // Start a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Move Twitter's posts to Google account
      for (const post of twitterAccount.posts) {
        await tx.post.update({
          where: { id: post.id },
          data: { userId: googleAccount.id }
        });
      }

      // 2. Move Twitter's account connection to Google user
      for (const account of twitterAccount.accounts) {
        await tx.account.update({
          where: { id: account.id },
          data: { userId: googleAccount.id }
        });
      }

      // 3. Delete Twitter's organization memberships
      await tx.organizationMembership.deleteMany({
        where: { userId: twitterAccount.id }
      });

      // 4. Delete the Twitter user
      await tx.user.delete({
        where: { id: twitterAccount.id }
      });

      logger.info('Successfully merged accounts', {
        primaryUserId: googleAccount.id,
        mergedUserId: twitterAccount.id,
        postsMoved: twitterAccount.posts.length,
        accountsMoved: twitterAccount.accounts.length
      });
    });

  } catch (error) {
    logger.error('Error merging accounts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the merge
mergeMyAccounts()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Merge failed:', error);
    process.exit(1);
  });
