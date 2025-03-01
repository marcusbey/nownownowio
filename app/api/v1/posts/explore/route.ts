import { prisma } from "@/lib/prisma/prisma";
import { baseAuth } from "@/lib/auth/auth";
import type { PostsPage } from "@/lib/types";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { detectTopicFromContent, getAvailableTopics } from "@/lib/topic-detection";

// Schema for explore posts query parameters
const explorePostsSchema = z.object({
  userId: z.string(),
  topic: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
});

export async function GET(request: Request) {
  try {
    // Authentication
    const session = await baseAuth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to view posts" },
        { status: 401 }
      );
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const params = {
      userId: session.user.id,
      topic: searchParams.get("topic") ?? undefined,
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit") ?? "20") : 20,
    };

    console.log("[EXPLORE_PARAMS]", params);

    const validatedParams = explorePostsSchema.parse(params);
    
    // Build the base query conditions - we'll filter by topic after fetching
    const whereConditions: Prisma.PostWhereInput = {};
    
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

    console.log(`[EXPLORE_FILTERED_POSTS] Original: ${posts.length}, Filtered: ${filteredPosts.length}`);

    // Format response as PostsPage
    const response: PostsPage = {
      posts: filteredPosts,
      nextCursor: filteredPosts.length > 0 && filteredPosts.length === validatedParams.limit 
        ? filteredPosts[filteredPosts.length - 1].id 
        : null,
    };

    return NextResponse.json(response);
  } catch (error) {
    // Safe error logging
    console.error("[EXPLORE_POSTS_GET_ERROR]", error instanceof Error ? error.message : String(error));

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request parameters", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: "Database error", message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}