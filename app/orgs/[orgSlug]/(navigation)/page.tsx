// UI Components
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/data-display/tabs";
import { Layout, LayoutContent } from "@/features/page/layout";
import { WidgetSetupBanner } from "@/components/feedback/widget-setup-banner";

// Auth & Data
import { baseAuth } from "@/lib/auth/auth";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";
import { isInRoles } from "@/lib/organizations/is-in-roles";
import { getWidgetSetupStatusQuery } from "../../../../src/query/widget/widget-setup-status.query";

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
          <div className="w-full mb-4">
            <WidgetSetupBanner orgSlug={orgSlug} />
          </div>
        )}
        <div className="mx-auto w-full max-w-2xl">
          <div className="sticky top-0 z-10 rounded-t-xl border-b border-zinc-800/50 bg-zinc-900 pb-4 pt-6 backdrop-blur-md">
            <div className="p-4 rounded-t-lg">
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
}
