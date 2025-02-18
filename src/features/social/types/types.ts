import { Media, User } from "@prisma/client";

export interface PostData {
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

export interface PostFormData {
  content: string;
  media?: File[];
}
