import type { ExtendedPost } from "../types";

const now = new Date();

// This function will create mock posts for any organization
export const createMockPosts = (orgId: string): ExtendedPost[] => [
  {
    id: "1",
    content: "🎉 Just launched our new social feed! Check out the modern design and improved interactions. Let me know what you think!",
    createdAt: now,
    updatedAt: now,
    userId: "user1",
    organizationId: orgId,
    user: {
      id: "user1",
      name: "Marcus Bey",
      email: "marcus@nownownow.io",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
    },
    organization: {
      id: orgId,
      name: "NowNowNow",
      slug: "nownownow",
      image: "https://api.dicebear.com/7.x/initials/svg?seed=NowNowNow",
    },
    _count: {
      comments: 2,
      likes: 5,
    },
  },
  {
    id: "2",
    content: "💡 Working on some exciting new features for our platform. The development workflow is getting smoother every day.",
    createdAt: new Date(now.getTime() - 15 * 60000), // 15 minutes ago
    updatedAt: new Date(now.getTime() - 15 * 60000),
    userId: "user2",
    organizationId: orgId,
    user: {
      id: "user2",
      name: "Sarah Dev",
      email: "sarah@nownownow.io",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    },
    organization: {
      id: orgId,
      name: "NowNowNow",
      slug: "nownownow",
      image: "https://api.dicebear.com/7.x/initials/svg?seed=NowNowNow",
    },
    _count: {
      comments: 3,
      likes: 8,
    },
  },
  {
    id: "3",
    content: "📊 Our analytics show great engagement with the new UI improvements. Users are spending more time interacting with posts!",
    createdAt: new Date(now.getTime() - 30 * 60000), // 30 minutes ago
    updatedAt: new Date(now.getTime() - 30 * 60000),
    userId: "user1",
    organizationId: orgId,
    user: {
      id: "user1",
      name: "Marcus Bey",
      email: "marcus@nownownow.io",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
    },
    organization: {
      id: orgId,
      name: "NowNowNow",
      slug: "nownownow",
      image: "https://api.dicebear.com/7.x/initials/svg?seed=NowNowNow",
    },
    _count: {
      comments: 4,
      likes: 12,
    },
  },
];
