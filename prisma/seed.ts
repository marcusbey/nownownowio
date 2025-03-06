import { PrismaClient, OrganizationPlanType, BillingCycle, SupportPriority } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create initial organization plans
  await prisma.organizationPlan.createMany({
    data: [
      // Free Plan
      { 
        id: 'FREE_MONTHLY',
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
      
      // Basic Plans
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
        canDeletePosts: false,
        canArchivePosts: true,
        hasAnalytics: true
      },
      {
        id: 'BASIC_ANNUAL',
        name: 'Basic Annual',
        type: OrganizationPlanType.BASIC,
        billingCycle: BillingCycle.ANNUAL,
        price: 8900, // $89/year (save ~$19)
        maximumOrganizations: 1,
        maximumMembers: 1,
        maximumWidgets: 1,
        monthlyViews: 500,
        canHideBranding: false,
        canUseCustomDomain: false,
        supportPriority: SupportPriority.STANDARD,
        canPinPosts: true,
        canEditPosts: true,
        canDeletePosts: false,
        canArchivePosts: true,
        hasAnalytics: true
      },
      {
        id: 'BASIC_LIFETIME',
        name: 'Basic Lifetime',
        type: OrganizationPlanType.BASIC,
        billingCycle: BillingCycle.LIFETIME,
        price: 19900, // $199 one-time
        maximumOrganizations: 1,
        maximumMembers: 1,
        maximumWidgets: 1,
        monthlyViews: 500,
        canHideBranding: false,
        canUseCustomDomain: false,
        supportPriority: SupportPriority.STANDARD,
        canPinPosts: true,
        canEditPosts: true,
        canDeletePosts: false,
        canArchivePosts: true,
        hasAnalytics: true
      },
      
      // Pro Plans
      {
        id: 'PRO_MONTHLY',
        name: 'Pro Monthly',
        type: OrganizationPlanType.PRO,
        billingCycle: BillingCycle.MONTHLY,
        price: 2900, // $29/month
        maximumOrganizations: 5,
        maximumMembers: 5,
        maximumWidgets: 5,
        monthlyViews: 100000,
        canHideBranding: true,
        canUseCustomDomain: true,
        supportPriority: SupportPriority.PRIORITY,
        canPinPosts: true,
        canEditPosts: true,
        canDeletePosts: true,
        canArchivePosts: true,
        hasAnalytics: true
      },
      {
        id: 'PRO_ANNUAL',
        name: 'Pro Annual',
        type: OrganizationPlanType.PRO,
        billingCycle: BillingCycle.ANNUAL,
        price: 29900, // $299/year (save ~$49)
        maximumOrganizations: 5,
        maximumMembers: 5,
        maximumWidgets: 5,
        monthlyViews: 100000,
        canHideBranding: true,
        canUseCustomDomain: true,
        supportPriority: SupportPriority.PRIORITY,
        canPinPosts: true,
        canEditPosts: true,
        canDeletePosts: true,
        canArchivePosts: true,
        hasAnalytics: true
      },
      {
        id: 'PRO_LIFETIME',
        name: 'Pro Lifetime',
        type: OrganizationPlanType.PRO,
        billingCycle: BillingCycle.LIFETIME,
        price: 59900, // $599 one-time
        maximumOrganizations: 5,
        maximumMembers: 5,
        maximumWidgets: 5,
        monthlyViews: 100000,
        canHideBranding: true,
        canUseCustomDomain: true,
        supportPriority: SupportPriority.PRIORITY,
        canPinPosts: true,
        canEditPosts: true,
        canDeletePosts: true,
        canArchivePosts: true,
        hasAnalytics: true
      }
    ],
    skipDuplicates: true,
  });

  // Create initial widget configurations for testing
  await prisma.widgetConfig.createMany({
    data: [
      {
        id: 'WIDGET_CONFIG_DEFAULT',
        organizationId: 'org_default', // This should match an existing organization ID
        theme: 'light',
        maxPostsToShow: 5,
        refreshInterval: 60,
        showBranding: true
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
