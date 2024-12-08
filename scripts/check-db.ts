import { prisma } from '../src/lib/prisma'

async function main() {
  try {
    // Check if PostView table exists
    const postView = await prisma.postView.findFirst();
    console.log('PostView table exists:', postView !== null);

    // Check if we can read posts
    const post = await prisma.post.findFirst({
      select: { id: true }
    });
    console.log('Can read posts:', post !== null);

    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database connection is working');
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
