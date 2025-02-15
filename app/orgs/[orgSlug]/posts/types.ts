import type { Organization, Post, User } from "@prisma/client";

export interface ExtendedPost extends Post {
  organization: Organization;
  user: User;
  _count: {
    comments: number;
    likes: number;
  };
}

export interface PostFormData {
  content: string;
  userId: string;
  organizationId: string;
}

export interface PostActionResult {
  success: boolean;
  error?: string;
}

export interface PostToggleLikeData {
  postId: string;
  userId: string;
  organizationId: string;
}
