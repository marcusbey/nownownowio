import type { Media, User } from "@prisma/client";

export type PostData = {
  id: string;
  content: string;
  createdAt: Date;
  user: User;
  media?: Media[];
  likes?: number;
  comments?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  views?: number;
}

export type PostFormData = {
  content: string;
  media?: File[];
}
