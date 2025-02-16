export interface Author {
  id: string;
  name: string;
  image: string;
  username: string;
  emailVerified: null;
  organizations: any[];
}

export interface ExtendedPost {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  organizationId: string;
  author: Author;
  _count: {
    likes: number;
    comments: number;
  };
  liked: boolean;
  bookmarked: boolean;
}
