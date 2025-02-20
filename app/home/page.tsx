import { PostCard } from "@/features/social/posts/post-card";
import { PostInput } from "@/features/social/posts/post-input";
import { mockPosts } from "@/features/social/mock/posts.mock";
import { auth } from "@/lib/auth/helper";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl">
        <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
          <PostInput userImage={session.image} userName={session.name} />
        </div>
        <div>
          {mockPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}
