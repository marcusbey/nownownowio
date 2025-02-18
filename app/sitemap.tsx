import { getFeedPosts } from "@/features/social/services/post-service";
import type { Post } from "@prisma/client";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getFeedPosts({
    userId: "system",
    limit: 100,
  });

  return [
    {
      url: "https://codeline.app",
      lastModified: new Date(),
      changeFrequency: "monthly",
    },
    {
      url: "https://codeline.app/login",
      lastModified: new Date(),
      changeFrequency: "monthly",
    },
    {
      url: "https://codeline.app/home",
      lastModified: new Date(),
      changeFrequency: "monthly",
    },
    ...posts.map(
      (post: Post) =>
        ({
          url: `https://codeline.app/posts/${post.id}`,
          lastModified: new Date(post.createdAt),
          changeFrequency: "monthly",
        }) as const,
    ),
  ];
}
