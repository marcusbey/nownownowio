const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Seed the database with initial organization plans
 */
async function main() {
  try {
    // Create initial organization plans based on actual schema
    await prisma.$executeRaw`TRUNCATE TABLE "OrganizationPlan" CASCADE;`;
    
    await prisma.$executeRawUnsafe(`
      INSERT INTO "OrganizationPlan" (
        id, name, type, "billingCycle", "maximumMembers", "maxPostsPerDay", 
        "maxCommentsPerDay", "maxLikesPerDay", "maxMediaPerPost", 
        "canSchedulePosts", "canPinPosts", "hasAnalytics", "createdAt", "updatedAt"
      ) VALUES 
      ('FREE', 'Free', 'FREE', 'MONTHLY', 1, 5, 20, 100, 1, false, false, false, NOW(), NOW()),
      ('BASIC_MONTHLY', 'Basic Monthly', 'BASIC', 'MONTHLY', 1, 2147483647, 2147483647, 2147483647, 1, false, true, false, NOW(), NOW()),
      ('BASIC_ANNUAL', 'Basic Annual', 'BASIC', 'ANNUAL', 1, 2147483647, 2147483647, 2147483647, 1, false, true, false, NOW(), NOW()),
      ('BASIC_LIFETIME', 'Basic Lifetime', 'BASIC', 'LIFETIME', 1, 2147483647, 2147483647, 2147483647, 1, false, true, false, NOW(), NOW()),
      ('PRO_MONTHLY', 'Pro Monthly', 'PRO', 'MONTHLY', 5, 2147483647, 2147483647, 2147483647, 5, true, true, true, NOW(), NOW()),
      ('PRO_ANNUAL', 'Pro Annual', 'PRO', 'ANNUAL', 5, 2147483647, 2147483647, 2147483647, 5, true, true, true, NOW(), NOW()),
      ('PRO_LIFETIME', 'Pro Lifetime', 'PRO', 'LIFETIME', 5, 2147483647, 2147483647, 2147483647, 5, true, true, true, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `);

    // Log success but only in development environment
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('Database seed completed successfully');
    }
    
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error during database seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the seed function
main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
