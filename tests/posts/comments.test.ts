import { prisma } from '@/lib/prisma';
import { AuthTestHelper } from '../helpers/auth.helper';
import { createTestPost, cleanupTestPost, createTestComment } from '../helpers/posts.helper';
import { PerformanceHelper } from '../helpers/performance.helper';

const perfHelper = new PerformanceHelper();

describe('Post Comments', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  let userId: string;
  let postId: string;

  beforeEach(async () => {
    const user = await AuthTestHelper.createTestUser({ email: testEmail });
    userId = user.id;
    const post = await createTestPost({ id: user.id });
    postId = post.id;
  });

  afterEach(async () => {
    await cleanupTestPost(postId);
    await AuthTestHelper.cleanupTestUser(testEmail);
    perfHelper.reset();
  });

  describe('Comment Creation', () => {
    it('should create comment with valid data', async () => {
      perfHelper.start('create-comment');
      const comment = await createTestComment(postId);
      perfHelper.end('create-comment');

      expect(comment).toBeDefined();
      expect(comment.postId).toBe(postId);
      expect(comment.content).toBeDefined();
    });

    it('should handle multiple comments on same post', async () => {
      const commentCount = 3;
      
      // Create multiple comments
      const comments = await Promise.all(
        Array(commentCount).fill(null).map(() => createTestComment(postId))
      );

      expect(comments).toHaveLength(commentCount);
      comments.forEach(comment => {
        expect(comment.postId).toBe(postId);
      });
    });
  });

  describe('Comment Management', () => {
    it('should update comment content', async () => {
      const comment = await createTestComment(postId);
      const newContent = 'Updated comment content';

      perfHelper.start('update-comment');
      const updatedComment = await prisma.comment.update({
        where: { id: comment.id },
        data: { content: newContent },
      });
      perfHelper.end('update-comment');

      expect(updatedComment.content).toBe(newContent);
    });

    it('should delete comment', async () => {
      const comment = await createTestComment(postId);

      perfHelper.start('delete-comment');
      await prisma.comment.delete({
        where: { id: comment.id },
      });
      perfHelper.end('delete-comment');

      const deletedComment = await prisma.comment.findUnique({
        where: { id: comment.id },
      });
      expect(deletedComment).toBeNull();
    });
  });

  describe('Comment Queries', () => {
    it('should fetch comments with user data', async () => {
      await createTestComment(postId);

      perfHelper.start('fetch-comments');
      const comments = await prisma.comment.findMany({
        where: { postId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });
      perfHelper.end('fetch-comments');

      expect(comments).toHaveLength(1);
      expect(comments[0].user).toBeDefined();
      expect(comments[0].user.name).toBeDefined();
    });

    it('should paginate comments', async () => {
      // Create multiple comments
      await Promise.all(
        Array(5).fill(null).map(() => createTestComment(postId))
      );

      const pageSize = 2;
      perfHelper.start('paginate-comments');
      const comments = await prisma.comment.findMany({
        where: { postId },
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      });
      perfHelper.end('paginate-comments');

      expect(comments).toHaveLength(pageSize);
    });
  });
});
