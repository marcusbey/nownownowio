import { auth } from "@/lib/auth/helper";
import { redirect } from "next/navigation";
import { PostInput } from "@/features/posts/components/post-input";
import { PostCard } from "@/features/posts/components/post-card";
import { mockPosts } from "@/features/posts/mock/posts.mock";

export default async function HomePage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto">
        <div className="sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b">
          <PostInput
            userImage={session.user?.image}
            userName={session.user?.name}
          />
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
