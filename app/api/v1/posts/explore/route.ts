import { baseAuth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { detectTopicFromContent } from "@/lib/topic-detection";
import type { PostsPage } from "@/lib/types";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

// Schema for explore posts query parameters
const explorePostsSchema = z.object({
  userId: z.string(),
  topic: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  q: z.string().optional(), // Search query parameter
});

export async function GET(request: Request) {
  // --- ENHANCED CACHING STRATEGY ---
  // Define cache headers for more aggressive caching
  const headers = {
    'Cache-Control': 'public, max-age=30, stale-while-revalidate=120', // Cache for 30s, revalidate for 2 mins
    'CDN-Cache-Control': 'public, s-maxage=60', // CDN cache for 1 min
    'Vercel-CDN-Cache-Control': 'public, s-maxage=60' // Vercel specific
  };

  try {
    // Authentication
    const session = await baseAuth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to view posts" },
        { status: 401, headers }
      );
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const params = {
      userId: session.user.id,
      topic: searchParams.get("topic") ?? undefined,
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit") ?? "20") : 20,
      q: searchParams.get("q") ?? undefined, // Get search query
    };

    console.log("[EXPLORE_PARAMS]", params);

    const validatedParams = explorePostsSchema.parse(params);

    // Build the base query conditions
    const whereConditions: Prisma.PostWhereInput = {};

    // Add search query conditions if provided
    if (validatedParams.q) {
      const searchQuery = validatedParams.q.trim();

      // Search in post content, user names, and organization names
      whereConditions.OR = [
        // Search in post content
        { content: { contains: searchQuery, mode: 'insensitive' } },

        // Search in user names
        {
          user: {
            OR: [
              { name: { contains: searchQuery, mode: 'insensitive' } },
              { displayName: { contains: searchQuery, mode: 'insensitive' } },
              { email: { contains: searchQuery, mode: 'insensitive' } },
              { bio: { contains: searchQuery, mode: 'insensitive' } },
            ]
          }
        },

        // Search in URLs within content
        { content: { contains: `http`, mode: 'insensitive' } }, // Basic URL detection
      ];
    }

    console.log("[EXPLORE_WHERE]", whereConditions);

    // Get posts with filters applied
    const posts = await prisma.post.findMany({
      where: whereConditions,
      orderBy: {
        createdAt: "desc",
      },
      take: validatedParams.limit,
      skip: validatedParams.cursor ? 1 : 0,
      cursor: validatedParams.cursor ? { id: validatedParams.cursor } : undefined,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            displayName: true,
            email: true,
            image: true,
            bio: true,
            createdAt: true,
            updatedAt: true,
            followers: {
              where: {
                followerId: validatedParams.userId,
              },
              select: {
                followerId: true,
              },
            },
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
              },
            },
          },
        },
        media: true,
        likes: {
          where: {
            userId: validatedParams.userId,
          },
          select: {
            userId: true,
          },
        },
        bookmarks: {
          where: {
            userId: validatedParams.userId,
          },
          select: {
            userId: true,
          },
        },
        comments: true,
        _count: {
          select: {
            likes: true,
            comments: true,
            bookmarks: true,
            views: true,
          },
        },
      },
    });

    console.log("[EXPLORE_POSTS_COUNT]", posts.length);

    // Apply topic filtering in-memory if a specific topic is requested
    let filteredPosts = posts;
    if (validatedParams.topic && validatedParams.topic !== "all") {
      filteredPosts = posts.filter(post => {
        // Detect topic from post content
        const detectedTopic = detectTopicFromContent(post.content);
        return detectedTopic === validatedParams.topic;
      });
    }

    // Additional URL filtering for search queries
    if (validatedParams.q?.includes('.')) {
      const urlQuery = validatedParams.q.toLowerCase();
      // Further filter posts that might contain URLs
      filteredPosts = filteredPosts.filter(post => {
        // Check if content contains the URL pattern
        return post.content.toLowerCase().includes(urlQuery);
      });
    }

    console.log(`[EXPLORE_FILTERED_POSTS] Original: ${posts.length}, Filtered: ${filteredPosts.length}`);

    // Format response as PostsPage
    const response: PostsPage = {
      posts: filteredPosts as any, // Use type assertion to avoid compatibility issues
      nextCursor: filteredPosts.length > 0 && filteredPosts.length === validatedParams.limit
        ? filteredPosts[filteredPosts.length - 1].id
        : null,
    };

    return NextResponse.json(response, { headers });
  } catch (error) {
    // Safe error logging
    console.error("[EXPLORE_POSTS_GET_ERROR]", error instanceof Error ? error.message : String(error));

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request parameters", details: error.errors },
        { status: 400, headers }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: "Database error", message: error.message },
        { status: 500, headers }
      );
    }

    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500, headers }
    );
  }
}