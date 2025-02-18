import { createPost, createPostSchema, getFeedPosts, getFeedPostsSchema } from "@/features/social/services/post-service";
import { baseAuth } from "@/lib/auth/auth";
import type { PostsPage } from "@/lib/types";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

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

    // Validate and create post
    console.log('[POST_DEBUG] Input:', input);
    const validatedData = createPostSchema.parse(input);
    console.log('[POST_DEBUG] Validated data:', validatedData);

    const post = await createPost(validatedData);
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