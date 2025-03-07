import { getFeedPosts } from "@/features/social/services/post-service";
import { prisma } from "@/lib/prisma";
import type { Post, Organization } from "@prisma/client";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get recent posts
  const posts = await getFeedPosts({
    userId: "system",
    limit: 100,
  });

  // Get organizations for org-specific pages
  const organizations = await prisma.organization.findMany({
    take: 50,
    orderBy: {
      createdAt: "desc",
    },
  });

  const baseUrl = "https://nownownow.io";

  return [
    // Static pages
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly",
    },
    
    // Post pages
    ...posts.map(
      (post: Post) => ({
        url: `${baseUrl}/posts/${post.id}`,
        lastModified: new Date(post.createdAt),
        changeFrequency: "weekly",
        priority: 0.8,
      }) as const
    ),
    
    // Organization pages
    ...organizations.map(
      (org: Organization) => ({
        url: `${baseUrl}/orgs/${org.slug}`,
        lastModified: new Date(org.updatedAt || org.createdAt),
        changeFrequency: "weekly",
        priority: 0.9,
      }) as const
    ),
    
    // Organization settings pages (lower priority as they're less public)
    ...organizations.map(
      (org: Organization) => ({
        url: `${baseUrl}/orgs/${org.slug}/settings`,
        lastModified: new Date(org.updatedAt || org.createdAt),
        changeFrequency: "monthly",
        priority: 0.5,
      }) as const
    ),
  ];
}
