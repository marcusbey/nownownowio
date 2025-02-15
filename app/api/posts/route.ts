import { NextResponse } from "next/server";
import { getFeedPosts, createPost } from "@/features/posts/services/post-service";
import { baseAuth } from "@/lib/auth/auth";
import { z } from "zod";

// Validation schemas
const getPostsSchema = z.object({
  organizationId: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.number().optional(),
});

const createPostSchema = z.object({
  content: z.string(),
  userId: z.string(),
  organizationId: z.string(),
});

export async function GET(request: Request) {
  try {
    const session = await baseAuth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const params = {
      organizationId: searchParams.get("organizationId") || undefined,
      cursor: searchParams.get("cursor") || undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined,
    };

    const validatedParams = getPostsSchema.parse(params);
    const posts = await getFeedPosts(validatedParams);

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("[POSTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await baseAuth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const validatedData = createPostSchema.parse(body);
    
    const post = await createPost(validatedData);
    
    return NextResponse.json({ post });
  } catch (error) {
    console.error("[POSTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
