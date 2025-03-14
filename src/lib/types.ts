import type { OrganizationMembershipRole} from "@prisma/client";
import { OrganizationPlanType, BillingCycle, Prisma } from "@prisma/client";

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
    posts: true,
    following: true,
    comments: true,
    likes: true,
    bookmarks: true,
    memberships: {
      select: {
        organization: {
          select: {
            slug: true,
            name: true,
          },
        },
        roles: true,
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
        // Note: 'organizations' field was removed as it doesn't exist in the User model
        // Instead, we already have memberships which contains organization info
      },
    },
    media: true, // Using 'media' instead of 'attachments' as per the Prisma schema
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
    notifications: true, // Added notifications as per the Prisma schema
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

export type PostsPage = {
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

export type CommentsPage = {
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

export type NotificationsPage = {
  notifications: NotificationData[];
  nextCursor: string | null;
}

export type FollowerInfo = {
  followers: number;
  isFollowedByUser: boolean;
}

export type LikeInfo = {
  likes: number;
  isLikedByUser: boolean;
}

export type BookmarkInfo = {
  isBookmarkedByUser: boolean;
}

export type NotificationCountInfo = {
  unreadCount: number;
}

export type MessageCountInfo = {
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
    websiteUrl: true,
    createdAt: true,
    updatedAt: true,
    followers: true,
    following: true,
    posts: true,
    comments: true,
    likes: true,
    bookmarks: true,
  };
}>;

export type Post = Prisma.PostGetPayload<{
  include: {
    user: true,
    media: true, // Using 'media' instead of 'attachments' as per the Prisma schema
    likes: true,
    bookmarks: true,
    comments: true,
    notifications: true, // Added notifications as per the Prisma schema
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