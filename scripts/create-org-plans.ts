import { PrismaClient, OrganizationPlanType, BillingCycle, SupportPriority } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating organization plans...');
  
  // Check if plans already exist
  const existingPlans = await prisma.organizationPlan.findMany();
  
  if (existingPlans.length > 0) {
    console.log(`Found ${existingPlans.length} existing plans. Skipping creation.`);
    return;
  }
  
  // Create initial organization plans
  const plans = [
    // Free Plan
    { 
      id: 'FREE',
      name: 'Free', 
      type: OrganizationPlanType.FREE,
      billingCycle: BillingCycle.MONTHLY,
      price: 0,
      maximumOrganizations: 1,
      maximumMembers: 1,
      maximumWidgets: 1,
      monthlyViews: 100,
      canHideBranding: false,
      canUseCustomDomain: false,
      supportPriority: SupportPriority.STANDARD,
      canPinPosts: false,
      canEditPosts: false,
      canDeletePosts: false,
      canArchivePosts: false,
      hasAnalytics: false
    },
    
    // Basic Monthly Plan
    {
      id: 'BASIC_MONTHLY',
      name: 'Basic Monthly',
      type: OrganizationPlanType.BASIC,
      billingCycle: BillingCycle.MONTHLY,
      price: 900, // $9/month
      maximumOrganizations: 1,
      maximumMembers: 1,
      maximumWidgets: 1,
      monthlyViews: 500,
      canHideBranding: false,
      canUseCustomDomain: false,
      supportPriority: SupportPriority.STANDARD,
      canPinPosts: true,
      canEditPosts: true,
      canDeletePosts: true,
      canArchivePosts: true,
      hasAnalytics: true
    },
    
    // Basic Annual Plan
    {
      id: 'BASIC_ANNUAL',
      name: 'Basic Annual',
      type: OrganizationPlanType.BASIC,
      billingCycle: BillingCycle.ANNUAL,
      price: 8640, // $86.40/year ($7.20/month)
      maximumOrganizations: 1,
      maximumMembers: 1,
      maximumWidgets: 1,
      monthlyViews: 500,
      canHideBranding: false,
      canUseCustomDomain: false,
      supportPriority: SupportPriority.STANDARD,
      canPinPosts: true,
      canEditPosts: true,
      canDeletePosts: true,
      canArchivePosts: true,
      hasAnalytics: true
    },
    
    // Pro Monthly Plan
    {
      id: 'PRO_MONTHLY',
      name: 'Pro Monthly',
      type: OrganizationPlanType.PRO,
      billingCycle: BillingCycle.MONTHLY,
      price: 2900, // $29/month
      maximumOrganizations: 3,
      maximumMembers: 5,
      maximumWidgets: 3,
      monthlyViews: 5000,
      canHideBranding: true,
      canUseCustomDomain: true,
      supportPriority: SupportPriority.PRIORITY,
      canPinPosts: true,
      canEditPosts: true,
      canDeletePosts: true,
      canArchivePosts: true,
      hasAnalytics: true
    },
    
    // Pro Annual Plan
    {
      id: 'PRO_ANNUAL',
      name: 'Pro Annual',
      type: OrganizationPlanType.PRO,
      billingCycle: BillingCycle.ANNUAL,
      price: 27840, // $278.40/year ($23.20/month)
      maximumOrganizations: 3,
      maximumMembers: 5,
      maximumWidgets: 3,
      monthlyViews: 5000,
      canHideBranding: true,
      canUseCustomDomain: true,
      supportPriority: SupportPriority.PRIORITY,
      canPinPosts: true,
      canEditPosts: true,
      canDeletePosts: true,
      canArchivePosts: true,
      hasAnalytics: true
    }
  ];
  
  for (const plan of plans) {
    try {
      await prisma.organizationPlan.create({
        data: plan
      });
      console.log(`Created plan: ${plan.name} (${plan.id})`);
    } catch (error) {
      console.error(`Error creating plan ${plan.id}:`, error);
    }
  }
  
  console.log('Organization plans created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
