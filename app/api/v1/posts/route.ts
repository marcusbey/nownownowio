import { getFeedPosts, getFeedPostsSchema } from "@/features/social/services/post-service";
import { baseAuth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import type { PostsPage } from "@/lib/types";
import { getDirectUploadthingUrl, verifyUploadthingUrl } from "@/lib/uploadthing-server";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

// Extended schema that accepts mediaUrls and mediaIds
// Allow empty content if media is present
const createPostWithMediaSchema = z.object({
  userId: z.string(),
  content: z.string(),
  mediaUrls: z.array(z.string()).optional(),
  mediaIds: z.array(z.string()).optional(),
  orgSlug: z.string().optional(),
}).refine(data => {
  // Require either non-empty content or at least one media URL/ID
  return (
    data.content.trim().length > 0 ||
    (data.mediaUrls?.length ?? 0) > 0 ||
    (data.mediaIds?.length ?? 0) > 0
  );
}, {
  message: "Post must contain either text content or media",
  path: ["content"],
});

export async function GET(request: Request, { params }: { params: Promise<Record<string, string>> }) {
  // Properly await params in Next.js 15, even though we're not using any params in this route
  await params;
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

    // Use type assertion to match the expected PostsPage type
    const response = {
      posts,
      nextCursor: posts.length === params.limit ? posts[posts.length - 1].id : null,
    } as PostsPage;

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

export async function POST(request: Request, { params }: { params: Promise<Record<string, string>> }) {
  // Properly await params in Next.js 15, even though we're not using any params in this route
  await params;
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
    const { content, mediaUrls, mediaIds: inputMediaIds, userId } = createPostWithMediaSchema.parse(input);

    // Use provided mediaIds if available, otherwise create new media records
    let mediaIds: string[] = [];

    // If we have mediaIds directly from UploadThing, use those
    if (inputMediaIds && inputMediaIds.length > 0) {
      console.log('[POST_DEBUG] Using provided media IDs:', inputMediaIds);
      mediaIds = inputMediaIds;
    }
    // Otherwise, if we have mediaUrls but no mediaIds, create new media records
    else if (mediaUrls && mediaUrls.length > 0) {
      console.log('[POST_DEBUG] Creating media records for URLs:', mediaUrls);

      try {
        // Create media records for each URL with validation and error handling
        const mediaRecords = await Promise.all(
          mediaUrls.map(async (url) => {
            if (!url) {
              console.log('[POST_DEBUG] Skipping empty URL');
              return null;
            }

            // Validate URL with proper UploadThing authentication
            try {
              // Get a direct URL for UploadThing
              const directUrl = getDirectUploadthingUrl(url);

              // Ensure the URL is absolute while preserving the original domain (8s2dp0f8rl.ufs.sh)
              let absoluteUrl = directUrl;
              
              // If the URL already contains 8s2dp0f8rl.ufs.sh, use it as is
              if (url.includes('8s2dp0f8rl.ufs.sh')) {
                absoluteUrl = url.startsWith('http') ? url : `https://${url}`;
                console.log('[POST_DEBUG] Preserving original UploadThing URL format:', absoluteUrl);
              }
              // Otherwise, ensure the URL has a proper protocol
              else if (!absoluteUrl.startsWith('http://') && !absoluteUrl.startsWith('https://')) {
                if (absoluteUrl.startsWith('utfs.io/') || absoluteUrl.includes('.utfs.io/')) {
                  absoluteUrl = `https://${absoluteUrl}`;
                } else if (absoluteUrl.includes('/f/') || absoluteUrl.match(/\/[a-zA-Z0-9_-]{20,}/)) {
                  const fileId = absoluteUrl.split('/').pop();
                  if (fileId && fileId.length > 20) {
                    // For non-8s2dp0f8rl URLs, use the app ID to construct the proper URL format
                    absoluteUrl = `https://8s2dp0f8rl.ufs.sh/f/${fileId}`;
                  }
                }
              }

              // Use our dedicated verification function
              const isValid = await verifyUploadthingUrl(absoluteUrl);

              if (!isValid) {
                console.error(`[POST_DEBUG] UploadThing URL validation failed: ${url}`);
                return null;
              }

              // Use the absolute URL for the media record
              url = absoluteUrl;
              console.log(`[POST_DEBUG] UploadThing URL validated successfully: ${url}`);
            } catch (e) {
              console.error(`[POST_DEBUG] Error validating UploadThing URL ${url}:`, e instanceof Error ? e.message : String(e));
              return null;
            }

            // Determine media type based on URL or file extension
            // Check for common video file extensions in the URL
            const isVideo = url.includes('.mp4') ||
              url.includes('.mov') ||
              url.includes('.avi') ||
              url.includes('.webm') ||
              // Also check for video-specific UploadThing URLs that might not have extensions
              url.includes('video') ||
              // Check for specific UploadThing URL patterns that we know are videos
              url.includes('32NrzzTW2Rvsmfg3QUNiH7ZlyMpJfCFuj3ewvgdIcSqK6LBT') ||
              url.includes('32NrzzTW2Rvslzkeh0W1LoihCHqtU8O27wgumEAvcsIZr9R6') ||
              url.includes('32NrzzTW2Rvsrm8pgVJKmDLNAdkqoahOJtb1pSUzQT2E7gfR');

            console.log(`[POST_DEBUG] Creating media record for URL: ${url}, type: ${isVideo ? 'VIDEO' : 'IMAGE'}`);

            return prisma.media.create({
              data: {
                url,
                type: isVideo ? 'VIDEO' : 'IMAGE',
                // Media will be associated with the post later
              },
            });
          })
        );

        // Filter out any null values and extract the IDs
        mediaIds = mediaRecords
          .filter((record): record is NonNullable<typeof record> => Boolean(record))
          .map(record => record.id);
        console.log('[POST_DEBUG] Created media records with IDs:', mediaIds);
      } catch (error) {
        console.error('[POST_DEBUG] Error creating media records:', error);
        // Continue with post creation even if media creation fails
      }
    }

    // Create post with connected media in one transaction
    console.log('[POST_DEBUG] Creating post with mediaIds:', mediaIds);

    // Use a transaction for data consistency
    const post = await prisma.$transaction(async (tx) => {
      // Create post with direct media connections in one operation
      const newPost = await tx.post.create({
        data: {
          userId,
          content,
          // Connect media directly during post creation
          ...(mediaIds.length > 0 ? {
            media: {
              connect: mediaIds.map(id => ({ id }))
            }
          } : {})
        },
        include: {
          user: true,
          media: true,
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
      });

      console.log('[POST_DEBUG] Post created with ID:', newPost.id);
      console.log('[POST_DEBUG] Directly connected media count:', newPost.media.length);

      return newPost;
    });

    // Double-check if we need to fix any media connections
    if (mediaIds.length > 0 && post.media.length === 0) {
      console.log('[POST_DEBUG] Media connection failed in the transaction, attempting fallback connection');

      try {
        // Fallback: Connect media to post with a direct update
        const updatedPost = await prisma.post.update({
          where: { id: post.id },
          data: {
            media: {
              connect: mediaIds.map(id => ({ id }))
            }
          },
          include: {
            user: true,
            media: true,
            _count: {
              select: {
                comments: true,
                likes: true,
              },
            },
          },
        });

        console.log('[POST_DEBUG] Post updated with media count:', updatedPost.media.length);
        console.log('[POST_DEBUG] Media details:', updatedPost.media.map(m => ({ id: m.id, type: m.type })));
        return NextResponse.json({ post: updatedPost }, { status: 201 });
      } catch (connectionError) {
        console.error('[POST_DEBUG] Failed to connect media in fallback:', connectionError);
      }
    }

    // Log the final post state before returning
    console.log('[POST_DEBUG] Final post media count:', post.media.length);
    if (post.media.length > 0) {
      console.log('[POST_DEBUG] First media item:', post.media[0]);
    }

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