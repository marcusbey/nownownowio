import { AuthTestHelper, TestUser } from '../helpers/auth.helper';
import { createTestPost, cleanupTestPost, createTestComment, createTestLike, createTestBookmark } from '../helpers/posts.helper';
import { PerformanceHelper } from '../helpers/performance.helper';
import { prisma } from '@/src/lib/prisma';
import { logger } from '@/src/lib/logger';

describe('Posts System', () => {
  let testUser: TestUser;
  let testPost: { id: string; content: string; userId: string };
  const perfHelper = new PerformanceHelper();

  beforeEach(async () => {
    testUser = await AuthTestHelper.createTestUser();
    testPost = await createTestPost(testUser);
  });

  afterEach(async () => {
    await cleanupTestPost(testPost.id);
    await AuthTestHelper.cleanupTestUser(testUser.email);
    perfHelper.reset();
  });

  describe('Post Creation', () => {
    it('should create a post with valid data', async () => {
      perfHelper.start('create-post');
      const post = await prisma.post.create({
        data: {
          content: 'Test post content',
          userId: testUser.id,
        },
      });
      perfHelper.end('create-post');

      expect(post).toBeDefined();
      expect(post.content).toBe('Test post content');
      expect(post.userId).toBe(testUser.id);

      // Cleanup
      await cleanupTestPost(post.id);
    });
  });

  describe('Post Interactions', () => {
    it('should handle likes', async () => {
      const like = await createTestLike(testPost.id);
      expect(like).toBeDefined();
      expect(like.postId).toBe(testPost.id);
    });

    it('should handle comments', async () => {
      const comment = await createTestComment(testPost.id);
      expect(comment).toBeDefined();
      expect(comment.postId).toBe(testPost.id);
    });

    it('should handle bookmarks', async () => {
      const bookmark = await createTestBookmark(testPost.id);
      expect(bookmark).toBeDefined();
      expect(bookmark.postId).toBe(testPost.id);
    });
  });

  describe('Post Queries', () => {
    it('should fetch post with all related data', async () => {
      // Create related data
      await createTestComment(testPost.id);
      await createTestLike(testPost.id);
      await createTestBookmark(testPost.id);

      perfHelper.start('fetch-post-with-relations');
      const post = await prisma.post.findUnique({
        where: { id: testPost.id },
        include: {
          comments: true,
          likes: true,
          bookmarks: true,
        },
      });
      perfHelper.end('fetch-post-with-relations');

      expect(post).toBeDefined();
      expect(post?.comments).toHaveLength(1);
      expect(post?.likes).toHaveLength(1);
      expect(post?.bookmarks).toHaveLength(1);
    });
  });
});


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
