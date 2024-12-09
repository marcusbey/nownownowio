import { auth } from "@/lib/auth/helper";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PostCard } from "@/features/posts/PostCard";
import { headers } from "next/headers";

export default async function BookmarksPage() {
  const headersList = headers();
  const user = await auth({ headers: headersList } as Request);
  
  if (!user?.email) {
    redirect("/sign-in");
  }

  const bookmarks = await prisma.bookmark.findMany({
    where: {
      user: {
        email: user.email,
      },
    },
    include: {
      post: {
        include: {
          user: true,
          attachments: true,
          likes: true,
          comments: true,
          bookmarks: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-8">Your Bookmarks</h1>
      {bookmarks.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <p>You haven't bookmarked any posts yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookmarks.map((bookmark) => (
            <PostCard
              key={bookmark.id}
              post={bookmark.post}
              currentUserEmail={user.email}
              initialIsBookmarked={true}
              bookmarkId={bookmark.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
