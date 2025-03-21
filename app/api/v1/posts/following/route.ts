import { baseAuth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import type { PostsPage } from "@/lib/types";
import type { NextRequest } from "next/server";

export const dynamic = 'force-dynamic';
export async function GET(req: NextRequest, { params }: { params: Promise<Record<string, string>> }) {
  // Properly await params in Next.js 15, even though we're not using any params in this route
  await params;
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") ?? undefined;
    const pageSize = 10;

    const session = await baseAuth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get the logged-in user ID for post data include
    const loggedInUserId = session.user.id;

    // Get the organizations that the user is a member of
    const userMemberships = await prisma.organizationMembership.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        organizationId: true,
      },
    });

    const organizationIds = userMemberships.map(membership => membership.organizationId);

    // Find posts that are either from users the current user follows
    // OR posts that belong to organizations the user is a member of
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          {
            // Posts from users the current user follows
            user: {
              followers: {
                some: {
                  followerId: loggedInUserId,
                },
              },
            },
          },
          {
            // Posts from organizations the user is a member of
            organizationId: {
              in: organizationIds,
            },
          },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            displayName: true,
            email: true,
            emailVerified: true,
            image: true,
            bio: true,
            resendContactId: true,
            passwordHash: true,
            websiteUrl: true,
            createdAt: true,
            updatedAt: true,
            memberships: {
              select: {
                organization: {
                  select: {
                    id: true,
                    slug: true,
                    name: true,
                    image: true,
                  },
                },
                roles: true,
              },
            },
            followers: {
              where: {
                followerId: loggedInUserId,
              },
              select: {
                followerId: true,
              },
            },
            posts: true,
            following: true,
            comments: true,
            likes: true,
            bookmarks: true,
            _count: {
              select: {
                posts: true,
                followers: true,
                following: true,
                comments: true,
                likes: true,
                bookmarks: true,
              },
            },
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
          },
        },
        media: true,
        likes: {
          where: {
            userId: loggedInUserId,
          },
          select: {
            userId: true,
          },
        },
        bookmarks: {
          where: {
            userId: loggedInUserId,
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
        notifications: true,
      },
    });

    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;

    // Use type assertion to match the expected PostsPage type
    const data = {
      posts: posts.slice(0, pageSize),
      nextCursor,
    } as PostsPage;

    return Response.json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    // Log error in development only
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Error in organization following posts:', errorMessage);
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
