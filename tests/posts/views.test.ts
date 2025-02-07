import { prisma } from '@/lib/prisma';
import { AuthTestHelper } from '../helpers/auth.helper';
import { createTestPost, cleanupTestPost } from '../helpers/posts.helper';
import { PerformanceHelper } from '../helpers/performance.helper';

const perfHelper = new PerformanceHelper();

describe('Post Views', () => {
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

  describe('View Tracking', () => {
    it('should track views from different IPs', async () => {
      const ips = ['1.1.1.1', '2.2.2.2', '3.3.3.3'];
      
      // Create views from different IPs
      perfHelper.start('create-views');
      await Promise.all(
        ips.map(ip =>
          prisma.postView.create({
            data: {
              postId,
              ip,
            },
          })
        )
      );
      perfHelper.end('create-views');

      // Get view count
      const viewCount = await prisma.postView.count({
        where: { postId },
      });

      expect(viewCount).toBe(ips.length);
    });

    it('should prevent duplicate views from same IP', async () => {
      const ip = '1.1.1.1';

      // Create first view
      await prisma.postView.create({
        data: {
          postId,
          ip,
        },
      });

      // Attempt duplicate view
      await expect(
        prisma.postView.create({
          data: {
            postId,
            ip,
          },
        })
      ).rejects.toThrow();
    });
  });

  describe('View Analytics', () => {
    it('should track view timestamps', async () => {
      const ip = '1.1.1.1';
      
      perfHelper.start('create-view');
      const view = await prisma.postView.create({
        data: {
          postId,
          ip,
        },
      });
      perfHelper.end('create-view');

      expect(view.createdAt).toBeDefined();
      expect(view.createdAt.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should aggregate view counts', async () => {
      // Create multiple views
      const ips = Array.from({ length: 5 }, (_, i) => `${i + 1}.${i + 1}.${i + 1}.${i + 1}`);
      
      await Promise.all(
        ips.map(ip =>
          prisma.postView.create({
            data: {
              postId,
              ip,
            },
          })
        )
      );

      // Get aggregated count
      const { _count } = await prisma.post.findUnique({
        where: { id: postId },
        select: {
          _count: {
            select: {
              views: true,
            },
          },
        },
      }) || { _count: { views: 0 } };

      expect(_count.views).toBe(ips.length);
    });
  });
});
