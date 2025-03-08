import { validateRequest } from '@/lib/auth/helper';
import { prisma } from '@/lib/prisma';
import { FollowerInfo } from '@/lib/types';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { user: loggedInUser } = await validateRequest();
    const { userId } = await params;

    if (!loggedInUser) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        followers: {
          where: {
            followerId: loggedInUser.id,
          },
          select: {
            followerId: true,
          },
        },
        _count: {
          select: {
            followers: true,
          },
        },
      },
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const data: FollowerInfo = {
      followers: user._count.followers,
      isFollowedByUser: !!user.followers.length,
    };

    return Response.json(data);
  } catch (error) {
    console.error('[FOLLOWER_INFO_ERROR]', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { user: loggedInUser } = await validateRequest();
    const { userId } = await params;

    if (!loggedInUser) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (userId === loggedInUser.id) {
      return Response.json({ error: 'You cannot follow yourself' }, { status: 400 });
    }

    // Check if user exists
    const userToFollow = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToFollow) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Use transaction to ensure both operations succeed or fail together
    await prisma.$transaction([
      prisma.follow.upsert({
        where: {
          followerId_followingId: {
            followerId: loggedInUser.id,
            followingId: userId,
          },
        },
        create: {
          followerId: loggedInUser.id,
          followingId: userId,
        },
        update: {}, // No updates needed if it already exists
      }),
      prisma.notification.create({
        data: {
          issuerId: loggedInUser.id,
          recipientId: userId,
          type: 'FOLLOW',
        },
      }),
    ]);

    // Get updated follower info for response
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        _count: { select: { followers: true } },
        followers: {
          where: { followerId: loggedInUser.id },
          select: { followerId: true },
        },
      },
    });

    return Response.json({
      followers: user?._count?.followers ?? 0,
      isFollowedByUser: true,
    });
  } catch (error) {
    console.error('[FOLLOW_USER_ERROR]', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { user: loggedInUser } = await validateRequest();
    const { userId } = await params;

    if (!loggedInUser) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Use transaction to ensure both operations succeed or fail together
    await prisma.$transaction([
      prisma.follow.deleteMany({
        where: {
          followerId: loggedInUser.id,
          followingId: userId,
        },
      }),
      prisma.notification.deleteMany({
        where: {
          issuerId: loggedInUser.id,
          recipientId: userId,
          type: 'FOLLOW',
        },
      }),
    ]);

    // Get updated follower info for response
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        _count: { select: { followers: true } },
        followers: {
          where: { followerId: loggedInUser.id },
          select: { followerId: true },
        },
      },
    });

    return Response.json({
      followers: user?._count?.followers ?? 0,
      isFollowedByUser: false,
    });
  } catch (error) {
    console.error('[UNFOLLOW_USER_ERROR]', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
