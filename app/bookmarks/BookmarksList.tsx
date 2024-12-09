import { baseAuth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { PostCard } from "@/features/posts/PostCard";

export default async function BookmarksList() {
  const session = await baseAuth();
  if (!session?.user?.email) {
    return null;
  }

  const bookmarks = await prisma.bookmark.findMany({
    where: {
      user: {
        email: session.user.email,
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

  if (bookmarks.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>You haven't bookmarked any posts yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {bookmarks.map((bookmark) => (
        <PostCard
          key={bookmark.id}
          post={bookmark.post}
          currentUserEmail={session.user.email}
          initialIsBookmarked={true}
          bookmarkId={bookmark.id}
        />
      ))}
    </div>
  );
}
