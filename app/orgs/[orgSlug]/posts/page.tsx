import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getFeedPosts } from "@/features/posts/post-manager";
import { PostFeed } from "@/features/posts/post-feed";
import { notFound } from "next/navigation";

interface PageProps {
  params: {
    orgSlug: string;
  };
}

export default async function OrganizationPostsPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) return notFound();

  const organization = await prisma.organization.findUnique({
    where: { slug: params.orgSlug },
    include: {
      members: {
        where: { userId: session.user.id },
      },
    },
  });

  if (!organization || !organization.members.length) {
    return notFound();
  }

  const initialPosts = await getFeedPosts({
    organizationId: organization.id,
  });

  return (
    <div className="container max-w-4xl">
      <h1 className="mb-8 text-2xl font-bold">
        Posts - {organization.name}
      </h1>
      
      <PostFeed
        organization={organization}
        currentUser={session.user}
        initialPosts={initialPosts}
      />
    </div>
  );
}
