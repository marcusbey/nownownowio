import { PrismaClient } from '@prisma/client';

const prismaClient = new PrismaClient();

async function main() {
  // Create or update the Free plan
  await prismaClient.organizationPlan.upsert({
    where: { id: 'FREE' },
    update: {
      name: 'Free',
      maximumMembers: 1,
    },
    create: {
      id: 'FREE',
      name: 'Free',
      maximumMembers: 1,
    },
  });

  // Create or update the Free Bird plan
  await prismaClient.organizationPlan.upsert({
    where: { id: 'FREE_BIRD' },
    update: {
      name: 'Free Bird',
      maximumMembers: 5,
    },
    create: {
      id: 'FREE_BIRD',
      name: 'Free Bird',
      maximumMembers: 5,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
