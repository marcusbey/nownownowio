import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create initial organization plans
  await prisma.organizationPlan.createMany({
    data: [
      { 
        id: 'FREEBIRD_RECURRING',
        name: 'Solo Bird', 
        type: 'FREE',
        maximumMembers: 1,
        maxPostsPerDay: 5,
        maxCommentsPerDay: 20,
        maxLikesPerDay: 100,
        maxMediaPerPost: 1,
        canSchedulePosts: true,
        canPinPosts: true,
        hasAnalytics: true
      },
      {
        id: 'FREEBIRD_LIFETIME',
        name: 'Lifetime Nest',
        type: 'LIFETIME',
        maximumMembers: 1,
        maxPostsPerDay: 10,
        maxCommentsPerDay: 40,
        maxLikesPerDay: 200,
        maxMediaPerPost: 4,
        canSchedulePosts: true,
        canPinPosts: true,
        hasAnalytics: true
      },
      {
        id: 'FLOCK_LEADER',
        name: 'Flock Leader',
        type: 'PREMIUM',
        maximumMembers: 100,
        maxPostsPerDay: 20,
        maxCommentsPerDay: 100,
        maxLikesPerDay: 500,
        maxMediaPerPost: 10,
        canSchedulePosts: true,
        canPinPosts: true,
        hasAnalytics: true
      }
    ],
    skipDuplicates: true,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
