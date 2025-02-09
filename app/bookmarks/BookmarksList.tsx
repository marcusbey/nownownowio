import { auth } from "@/lib/auth/helper";
import { prisma } from "@/lib/prisma";
import Post from "@/components/posts/Post";
import { Prisma } from "@prisma/client";

export default async function BookmarksList() {
  const session = await auth();
  if (!session) return null;

  const bookmarks = await prisma.bookmark.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      post: {
        include: {
          user: {
            include: {
              _count: {
                select: {
                  followers: true,
                  following: true,
                  posts: true,
                  comments: true,
                  likes: true,
                  bookmarks: true,
                }
              },
              organizations: {
                include: {
                  organization: {
                    select: {
                      name: true,
                      slug: true,
                    },
                  },
                },
              },
              posts: true,
              comments: true,
              likes: true,
              bookmarks: true,
              followers: true,
              following: true,
              notifications: true,
              issuedNotifications: true,
            },
            select: {
              id: true,
              name: true,
              displayName: true,
              email: true,
              emailVerified: true,
              image: true,
              bio: true,
              resendContactId: true,
              passwordHash: true,
              widgetToken: true,
              websiteUrl: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          comments: true,
          likes: true,
          bookmarks: true,
          attachments: true,
          linkedNotifications: true,
          _count: true
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!bookmarks.length) {
    return (
      <div className="text-center text-muted-foreground">
        <p>No bookmarks yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {bookmarks.map((bookmark) => (
        <Post
          key={bookmark.id}
          post={bookmark.post}
        />
      ))}
    </div>
  );
}
