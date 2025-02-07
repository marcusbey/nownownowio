import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';
import { AuthTestHelper, TestUser } from './auth.helper';

export interface TestPost {
  id: string;
  content: string;
  userId: string;
}

export const createTestPost = async (user?: TestUser): Promise<TestPost> => {
  const testUser = user || await AuthTestHelper.createTestUser();
  
  const post = await prisma.post.create({
    data: {
      content: `Test post ${randomUUID()}`,
      userId: testUser.id,
    },
  });

  return {
    id: post.id,
    content: post.content,
    userId: post.userId,
  };
};

export const cleanupTestPost = async (postId: string) => {
  await prisma.post.delete({
    where: { id: postId },
  });
};

export const createTestComment = async (postId: string, user?: TestUser) => {
  const testUser = user || await AuthTestHelper.createTestUser();
  
  return prisma.comment.create({
    data: {
      content: `Test comment ${randomUUID()}`,
      postId,
      userId: testUser.id,
    },
  });
};

export const createTestLike = async (postId: string, user?: TestUser) => {
  const testUser = user || await AuthTestHelper.createTestUser();
  
  return prisma.like.create({
    data: {
      postId,
      userId: testUser.id,
    },
  });
};

export const createTestBookmark = async (postId: string, user?: TestUser) => {
  const testUser = user || await AuthTestHelper.createTestUser();
  
  return prisma.bookmark.create({
    data: {
      postId,
      userId: testUser.id,
    },
  });
};
