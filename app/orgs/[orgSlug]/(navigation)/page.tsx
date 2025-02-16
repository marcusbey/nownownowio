// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";

// Auth & Data
import { baseAuth } from "@/lib/auth/auth";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";

// Types
import type { PageParams } from "@/types/next";

// Local Components
import { PostFormWrapper } from "./posts/components/post-form-wrapper";
import ForYouFeed from "./ForYouFeed";
import FollowingFeed from "./FollowingFeed";

export default async function RoutePage(
  props: PageParams<{
    orgSlug: string;
  }>,
) {
  const org = await getRequiredCurrentOrgCache();
  const session = await baseAuth();
  const user = session?.user;
  
  if (!user) {
    return null; // Handle unauthorized access
  }

  return (
    <Layout>
      <LayoutContent>
        <div className="mx-auto w-full max-w-2xl">
          <div className="sticky top-0 z-10 bg-background pt-6 pb-4">
            <PostFormWrapper organization={org} userId={user.id} />
            <div className="h-px bg-border/40 mt-4" />
          </div>
          
          <div className="mt-4">
            <Tabs defaultValue="for-you" className="space-y-6">
              <TabsList className="w-full bg-muted/50 p-1 h-11">
                <TabsTrigger value="for-you" className="flex-1 text-sm font-medium">
                  For you
                </TabsTrigger>
                <TabsTrigger value="following" className="flex-1 text-sm font-medium">
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
