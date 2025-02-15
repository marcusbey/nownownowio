import { OrganizationMembershipRole, Prisma } from "@prisma/client";

export function getUserDataSelect(loggedInUserId: string) {
  return Prisma.validator<Prisma.UserSelect>()({
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
    followers: {
      where: {
        followerId: loggedInUserId,
      },
      select: {
        followerId: true,
      },
    },
    notifications: true,
    issuedNotifications: true,
    posts: true,
    following: true,
    comments: true,
    likes: true,
    bookmarks: true,
    organizations: {
      select: {
        organization: {
          select: {
            slug: true,
            name: true,
          },
        },
      },
    },
    _count: {
      select: {
        posts: true,
        followers: true,
        following: true,
        comments: true,
        likes: true,
        bookmarks: true,
      },
    },
  });
}

export type UserData = Prisma.UserGetPayload<{
  select: ReturnType<typeof getUserDataSelect>;
}>;

export function getPostDataInclude(loggedInUserId: string) {
  return {
    user: {
      select: {
        ...getUserDataSelect(loggedInUserId),
        organizations: {
          select: {
            organization: {
              select: {
                slug: true,
                name: true,
              },
            },
          },
        },
      },
    },
    attachments: true,
    likes: {
      where: {
        userId: loggedInUserId,
      },
      select: {
        userId: true,
      },
    },
    bookmarks: {
      where: {
        userId: loggedInUserId,
      },
      select: {
        userId: true,
      },
    },
    comments: true,
    linkedNotifications: true,
    _count: {
      select: {
        likes: true,
        comments: true,
        bookmarks: true,
        views: true,
      },
    },
  } satisfies Prisma.PostInclude;
}

export type PostData = Prisma.PostGetPayload<{
  include: ReturnType<typeof getPostDataInclude>;
}>;

export interface PostsPage {
  posts: PostData[];
  nextCursor: string | null;
}

export function getCommentDataInclude(loggedInUserId: string) {
  return {
    user: {
      select: getUserDataSelect(loggedInUserId),
    },
    post: true,
  } satisfies Prisma.CommentInclude;
}

export type CommentData = Prisma.CommentGetPayload<{
  include: ReturnType<typeof getCommentDataInclude>;
}>;

export interface CommentsPage {
  comments: CommentData[];
  previousCursor: string | null;
}

export const notificationsInclude = {
  issuer: {
    select: {
      id: true,
      name: true,
      displayName: true,
      image: true,
    },
  },
  recipient: {
    select: {
      id: true,
      name: true,
      displayName: true,
      image: true,
    },
  },
  post: {
    select: {
      id: true,
      content: true,
    },
  },
} satisfies Prisma.NotificationInclude;

export type NotificationData = Prisma.NotificationGetPayload<{
  include: typeof notificationsInclude;
}>;

export interface NotificationsPage {
  notifications: NotificationData[];
  nextCursor: string | null;
}

export interface FollowerInfo {
  followers: number;
  isFollowedByUser: boolean;
}

export interface LikeInfo {
  likes: number;
  isLikedByUser: boolean;
}

export interface BookmarkInfo {
  isBookmarkedByUser: boolean;
}

export interface NotificationCountInfo {
  unreadCount: number;
}

export interface MessageCountInfo {
  unreadCount: number;
}

export type NavigationLink = {
  title: string;
  links: {
    href: string;
    icon: React.ComponentType;
    label: string;
    roles?: OrganizationMembershipRole[];
  }[];
};

export type User = Prisma.UserGetPayload<{
  select: {
    id: true;
    name: true;
    displayName: true;
    email: true;
    emailVerified: true;
    image: true;
    bio: true;
    resendContactId: true;
    passwordHash: true,
    widgetToken: true,
    websiteUrl: true,
    createdAt: true,
    updatedAt: true,
    followers: true,
    following: true,
    posts: true,
    comments: true,
    likes: true,
    bookmarks: true,
    notifications: true,
    issuedNotifications: true,
  };
}>;

export type Post = Prisma.PostGetPayload<{
  include: {
    user: true,
    attachments: true,
    likes: true,
    bookmarks: true,
    comments: true,
    linkedNotifications: true,
    _count: {
      select: {
        likes: true,
        comments: true,
        bookmarks: true,
        views: true,
      },
    },
  };
}>;