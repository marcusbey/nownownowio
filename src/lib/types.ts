import type { OrganizationMembershipRole } from "@prisma/client";
import { Prisma } from "@prisma/client";

export function getUserDataSelect(loggedInUserId: string) {
  return Prisma.validator<Prisma.UserSelect>()({    
    id: true,
    name: true,
    displayName: true,
    email: true, // Keep email if needed for display/contact
    image: true,
    bio: true, // Include bio if shown in tooltips/profiles
    bannerImage: true, // Include banner if shown
    createdAt: true, // Keep for 'Joined' date
    // Select only necessary fields from relations
    followers: {
      where: { followerId: loggedInUserId },
      select: { followerId: true }, // Only need to know *if* followed
    },
    _count: { // Keep counts as they are efficient
      select: {
        posts: true,
        followers: true,
        following: true,
      },
    },
    memberships: { // Fetch only necessary org info for context/links
      select: {
        organization: {
          select: {
            slug: true,
            name: true, // Keep name for display
            image: true, // Keep image for display
          },
        },
        roles: true, // Keep roles for permissions
      },
      take: 5 // Limit memberships fetched if not all are needed immediately
    },
  });
}

export type UserData = Prisma.UserGetPayload<{
  select: ReturnType<typeof getUserDataSelect>;
}>;

export function getPostDataInclude(loggedInUserId: string) {
  return {
    user: {
      select: { // Select only absolutely necessary user fields for a post card
        id: true,
        name: true,
        displayName: true,
        image: true,
        memberships: { // Needed for profile link construction in Post component
          select: {
            organization: { select: { slug: true } }
          },
          take: 1 // Only need one for the link
        }
      },
    },
    media: true, // Keep media
    likes: {
      where: { userId: loggedInUserId },
      select: { userId: true }, // Only need to know if liked by current user
    },
    bookmarks: {
      where: { userId: loggedInUserId },
      select: { userId: true }, // Only need to know if bookmarked by current user
    },
    // Removed comments: true - fetch comments separately on demand
    _count: { // Keep counts
      select: {
        likes: true,
        comments: true,
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
      select: { // Select minimal user info for comments
        id: true,
        name: true,
        displayName: true,
        image: true,
        memberships: { // Needed for profile link construction in Comment component
          select: {
            organization: { select: { slug: true } }
          },
          take: 1
        }
      },
    },
    // Removed post: true - usually not needed when viewing comments under a post
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
      // Only select minimal user fields needed for notification display
    },
  },
  recipient: {
    select: {
      id: true,
      // Minimal recipient info since we usually already have this context
    },
  },
  post: {
    select: {
      id: true,
      content: true,
      // Only fetch minimal post data needed for notification context
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
