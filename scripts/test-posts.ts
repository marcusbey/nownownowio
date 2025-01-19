import { prisma } from '../src/lib/prisma';
import { logger } from '../src/lib/logger';

async function cleanupTestData() {
  logger.info("🧹 Cleaning up test data...");
  await prisma.postView.deleteMany({
    where: { postId: { startsWith: "test-" } },
  });
  await prisma.comment.deleteMany({
    where: { postId: { startsWith: "test-" } },
  });
  await prisma.post.deleteMany({
    where: { id: { startsWith: "test-" } },
  });
  await prisma.user.deleteMany({
    where: { email: "test-post@example.com" },
  });
  logger.info("✨ Test data cleanup complete");
}

async function testPostCreation() {
  const user = await prisma.user.create({
    data: {
      id: "test-user-1",
      email: "test-post@example.com",
      name: "Test User",
    },
  });

  const post = await prisma.post.create({
    data: {
      id: "test-post-1",
      content: "Test post content",
      userId: user.id,
    },
  });

  logger.info("✅ Post Creation", {
    details: {
      postId: post.id,
      content: post.content,
      userId: post.userId,
    },
  });

  return { user, post };
}

async function testPostViews(postId: string) {
  // Create multiple views from different IPs
  const viewsData = [
    { clientIp: "1.1.1.1", viewerId: "anon-1" },
    { clientIp: "1.1.1.2", viewerId: "anon-2" },
    { clientIp: "1.1.1.1", viewerId: "anon-1" }, // Duplicate view, shouldn't count
  ];

  for (const data of viewsData) {
    await prisma.postView.upsert({
      where: {
        postId_viewerId_clientIp: {
          postId,
          viewerId: data.viewerId,
          clientIp: data.clientIp,
        },
      },
      create: {
        id: `test-view-${Math.random().toString(36).slice(2, 13)}`,
        postId,
        viewerId: data.viewerId,
        clientIp: data.clientIp,
        viewedAt: new Date(),
      },
      update: {
        viewedAt: new Date(),
      },
    });
  }

  const viewCount = await prisma.postView.count({
    where: { postId },
  });

  logger.info("✅ Post Views", {
    details: {
      postId,
      uniqueViews: viewCount,
      expectedViews: 2, // Should be 2 since one view is duplicate
    },
  });
}

async function testComments(postId: string, userId: string) {
  // Create multiple comments
  const comments = await Promise.all([
    prisma.comment.create({
      data: {
        id: "test-comment-1",
        content: "First comment",
        postId,
        userId,
      },
    }),
    prisma.comment.create({
      data: {
        id: "test-comment-2",
        content: "Second comment",
        postId,
        userId,
      },
    }),
  ]);

  const commentCount = await prisma.comment.count({
    where: { postId },
  });

  logger.info("✅ Comments", {
    details: {
      postId,
      commentCount,
      comments: comments.map((c) => ({
        id: c.id,
        content: c.content,
      })),
    },
  });
}

async function main() {
  logger.info("Starting Post Tests...");

  try {
    await cleanupTestData();

    // Test post creation
    const { user, post } = await testPostCreation();

    // Test post views
    await testPostViews(post.id);

    // Test comments
    await testComments(post.id, user.id);

    logger.info("✨ All tests completed successfully!");
  } catch (error) {
    logger.error("❌ Test failed", { error });
    process.exit(1);
  } finally {
    await cleanupTestData();
    await prisma.$disconnect();
  }
}

main();
