import PostEditor from "@/components/posts/editor/PostEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ForYouFeed from "./ForYouFeed";
import FollowingFeed from "./FollowingFeed";
import { buttonVariants } from "@/components/ui/button";
import {
  Layout,
  LayoutActions,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";
import type { PageParams } from "@/types/next";
import { PostForm } from "../posts/components/post-form";
import { PostFeed } from "../posts/components/post-feed";
import { baseAuth } from "@/lib/auth/auth"; 

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
            <PostForm organization={org} userId={user.id} />
          </div>
          <Tabs defaultValue="for-you">
          <TabsList>
            <TabsTrigger value="for-you">For you</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>
          <TabsContent value="for-you">
            <ForYouFeed />
          </TabsContent>
          <TabsContent value="following">
            <FollowingFeed />
          </TabsContent>
        </Tabs>
        </div>
      </LayoutContent>
    </Layout>
  );
}
