import type { ExtendedPost } from "../types";

const mockUsers = [
  {
    id: "user1",
    name: "Alex Thompson",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    username: "alexthompson",
  },
  {
    id: "user2",
    name: "Sarah Chen",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    username: "sarahchen",
  },
  {
    id: "user3",
    name: "Marcus Rodriguez",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
    username: "marcusrodriguez",
  },
];

const mockContent = [
  "Just wrapped up an amazing brainstorming session! 🧠 #Innovation",
  "New feature deployment successful! 🚀 #TechLife",
  "Great team meeting today - excited about our new direction! 📈",
  "Working on improving our user experience. Any suggestions? 🤔",
  "Coffee break with the team! ☕️ #WorkLife",
];

export function createMockPosts(orgSlug: string): ExtendedPost[] {
  return Array.from({ length: 5 }, (_, i) => {
    const user = mockUsers[i % mockUsers.length];
    const date = new Date();
    date.setHours(date.getHours() - i);

    return {
      id: `post-${i}-${orgSlug}`,
      content: mockContent[i % mockContent.length],
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
      userId: user.id,
      organizationId: orgSlug,
      author: {
        ...user,
        emailVerified: null,
        organizations: [],
      },
      _count: {
        likes: Math.floor(Math.random() * 50),
        comments: Math.floor(Math.random() * 20),
      },
      liked: Math.random() > 0.5,
      bookmarked: Math.random() > 0.7,
    };
  });
}
