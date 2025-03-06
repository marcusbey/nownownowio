// UI Components
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/data-display/tabs";
import { Layout, LayoutContent } from "@/features/page/layout";

// Auth & Data
import { baseAuth } from "@/lib/auth/auth";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";

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
  const { org: organization, user, roles } = await getRequiredCurrentOrgCache();
  const session = await baseAuth();

  if (!session?.user?.id) {
    return null; // Handle unauthorized access
  }
  return (
    <Layout>
      <LayoutContent>
        <div className="mx-auto w-full max-w-2xl">
          <div className="sticky top-0 z-10 pb-4 pt-6 bg-gradient-to-r from-zinc-900/95 via-zinc-800/90 to-zinc-900/95 backdrop-blur-md shadow-[0_0_15px_rgba(120,113,255,0.15)] border-b border-indigo-500/10">
            <div className="relative p-4 before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r before:from-indigo-500/5 before:via-fuchsia-500/5 before:to-indigo-500/5 before:opacity-70 before:blur-xl">
              <div className="relative z-10">
                <PostForm
                  organization={{ id: organization.id, name: organization.name }}
                  userId={user.id}
                  userImage={user.image}
                />
              </div>
            </div>
            <div className="mt-4 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
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
