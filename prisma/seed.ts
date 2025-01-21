const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Create or update the Free plan
  await prisma.organizationPlan.upsert({
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
  await prisma.organizationPlan.upsert({
    where: { id: 'FREEBIRD' },
    update: {
      name: 'Free Bird',
      maximumMembers: 1,
    },
    create: {
      id: 'FREEBIRD',
      name: 'Free Bird',
      maximumMembers: 1,
    },
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
