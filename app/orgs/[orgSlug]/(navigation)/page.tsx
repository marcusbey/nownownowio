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
      <LayoutHeader>
        <LayoutTitle>{org.name} Feed</LayoutTitle>
      </LayoutHeader>
      <LayoutContent>
        <div className="mx-auto w-full max-w-2xl">
          <div className="sticky top-16 z-10 bg-background/80 backdrop-blur-sm border-b mb-6">
            <PostFormWrapper organization={org} userId={user.id} />
          </div>
          <Tabs defaultValue="for-you" className="space-y-4">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="for-you">For you</TabsTrigger>
              <TabsTrigger value="following">Following</TabsTrigger>
            </TabsList>
            <TabsContent value="for-you" className="mt-0">
              <ForYouFeed />
            </TabsContent>
            <TabsContent value="following" className="mt-0">
              <FollowingFeed />
            </TabsContent>
          </Tabs>
        </div>
      </LayoutContent>
    </Layout>
  );
}
