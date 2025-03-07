import { createPost, getFeedPosts, getFeedPostsSchema } from "@/features/social/services/post-service";
import { baseAuth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import type { PostsPage } from "@/lib/types";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

// Extended schema that accepts mediaUrls
const createPostWithMediaSchema = z.object({
  userId: z.string(),
  content: z.string().min(1),
  mediaUrls: z.array(z.string()).optional(),
  orgSlug: z.string().optional(),
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
    const feedType = searchParams.get("feed") ?? "org";
    const params = {
      userId: session.user.id,
      organizationId: feedType === "org" ? searchParams.get("organizationId") ?? undefined : undefined,
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit") ?? "20") : 20,
    };

    const validatedParams = getFeedPostsSchema.parse(params);
    const posts = await getFeedPosts(validatedParams);

    // Format response as PostsPage
    const response: PostsPage = {
      posts,
      nextCursor: posts.length === params.limit ? posts[posts.length - 1].id : null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[POSTS_GET]", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid request parameters", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: "Database error", message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Authentication
    const session = await baseAuth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to create a post" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const input = {
      ...body,
      userId: session.user.id,
    };

    // Log the input for debugging
    console.log('[POST_DEBUG] Input:', input);

    // Validate with our extended schema
    const { content, mediaUrls, userId } = createPostWithMediaSchema.parse(input);

    // Create media records if URLs are provided
    let mediaIds: string[] = [];

    if (mediaUrls && mediaUrls.length > 0) {
      console.log('[POST_DEBUG] Creating media records for URLs:', mediaUrls);

      // Create media records for each URL
      const mediaRecords = await Promise.all(
        mediaUrls.map(async (url) => {
          // Determine media type based on URL or file extension
          const isVideo = url.includes('.mp4') ||
            url.includes('.mov') ||
            url.includes('.avi') ||
            url.includes('.webm');

          return prisma.media.create({
            data: {
              url,
              type: isVideo ? 'VIDEO' : 'IMAGE',
              // Media will be associated with the post later
            },
          });
        })
      );

      // Extract the IDs
      mediaIds = mediaRecords.map(record => record.id);
      console.log('[POST_DEBUG] Created media records with IDs:', mediaIds);
    }

    // Create post with the media IDs
    const postData = {
      userId,
      content,
      mediaIds: mediaIds.length > 0 ? mediaIds : undefined,
    };

    console.log('[POST_DEBUG] Creating post with data:', postData);
    const post = await createPost(postData);

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("[POSTS_POST]", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid post data", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: "Database error", message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}