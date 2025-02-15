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
import { PostForm } from "@/features/posts/components/post-form";
import { PostFeed } from "@/features/posts/components/post-feed";
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
        <LayoutTitle>Home</LayoutTitle>
      </LayoutHeader>
      <LayoutContent className="flex flex-col gap-4 lg:gap-8">
        <PostForm organization={org} userId={user.id} />
        <PostFeed organizationId={org.id} />
      </LayoutContent>
    </Layout>
  );
}
