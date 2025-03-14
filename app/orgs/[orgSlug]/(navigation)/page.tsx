// UI Components
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/data-display/tabs";
import { Layout, LayoutContent } from "@/features/page/layout";
import { WidgetSetupBanner } from "@/components/feedback/widget-setup-banner";
import Link from "next/link";

// Auth & Data
import { baseAuth } from "@/lib/auth/auth";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";
import { isInRoles } from "@/lib/organizations/is-in-roles";
import { getWidgetSetupStatusQuery } from "../../../../src/query/widget/widget-setup-status.query";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

// Types
import type { PageParams } from "@/types/next";

// Local Components
import { PostForm } from "@/features/social/posts/post-form";
import FollowingFeed from "./FollowingFeed";
import ForYouFeed from "./ForYouFeed";

export default async function RoutePage(
  props: PageParams<{
    orgSlug: string;
  }>,
) {
  // In Next.js 15, we need to await the params object
  const awaitedParams = await props.params;
  const orgSlug = awaitedParams.orgSlug;
  
  try {
    // First check if the organization exists directly
    const orgExists = await prisma.organization.findUnique({
      where: { slug: orgSlug },
      select: { id: true }
    });
    
    // If organization doesn't exist, try to find similar ones
    if (!orgExists) {
      // Look for similar organizations based on the first part of the slug
      const similarOrgs = await prisma.organization.findMany({
        where: {
          slug: {
            contains: orgSlug.split('-')[0],
            mode: 'insensitive'
          }
        },
        take: 1,
        select: { slug: true }
      });
      
      // If we found a similar organization, redirect to it
      if (similarOrgs.length > 0) {
        console.info(`Redirecting from ${orgSlug} to similar organization: ${similarOrgs[0].slug}`);
        redirect(`/orgs/${similarOrgs[0].slug}`);
      }
      
      // If no similar organizations found, redirect to the organizations list
      redirect('/orgs');
    }
    
    const { org: organization, user, roles } = await getRequiredCurrentOrgCache(orgSlug);
    const session = await baseAuth();
    
    // Check if the widget has been set up
    const widgetSetupStatus = await getWidgetSetupStatusQuery(organization.id);
    const showWidgetSetupBanner = !widgetSetupStatus.isConfigured && isInRoles(roles, ["ADMIN", "OWNER"]);

    if (!session?.user?.id) {
      return null; // Handle unauthorized access
    }
  return (
    <Layout>
      <LayoutContent>
        {showWidgetSetupBanner && (
          <div className="mb-4 w-full">
            <WidgetSetupBanner orgSlug={orgSlug} />
          </div>
        )}
        <div className="mx-auto w-full max-w-2xl">
          <div className="sticky top-0 z-10 rounded-t-xl border-b border-zinc-800/50 bg-zinc-900 pb-4 pt-6 backdrop-blur-md">
            <div className="rounded-t-lg p-4">
              <PostForm
                organization={{ id: organization.id, name: organization.name }}
                userId={user?.id ?? session.user.id}
                userImage={user?.image ?? session.user.image}
              />
            </div>
          </div>

          <div className="mt-4">
            <Tabs defaultValue="for-you" className="space-y-6">
              <TabsList className="h-11 w-full bg-muted/50 p-1">
                <TabsTrigger
                  value="for-you"
                  className="flex-1 text-sm font-medium"
                >
                  For you
                </TabsTrigger>
                <TabsTrigger
                  value="following"
                  className="flex-1 text-sm font-medium"
                >
                  Following
                </TabsTrigger>
              </TabsList>

              <TabsContent value="for-you" className="mt-0">
                <ForYouFeed />
              </TabsContent>

              <TabsContent value="following" className="mt-0">
                <FollowingFeed />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </LayoutContent>
    </Layout>
  );
  } catch (error) {
    // Handle organization not found or access denied errors
    return (
      <Layout>
        <LayoutContent>
          <div className="flex min-h-[50vh] flex-col items-center justify-center p-4 text-center">
            <h1 className="mb-4 text-2xl font-bold">Organization Error</h1>
            <p className="mb-6 text-muted-foreground">
              {error instanceof Error ? error.message : 'An error occurred while accessing this organization'}
            </p>
            <Link href="/orgs" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
              Go to My Organizations
            </Link>
          </div>
        </LayoutContent>
      </Layout>
    );
  }
}
