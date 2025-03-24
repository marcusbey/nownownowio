import { requiredAuth } from "@/lib/auth/helper";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  try {
    const user = await requiredAuth();
    const body = await request.json();

    // Validate the inputs
    const updates: Record<string, any> = {};

    // Only allow specific fields to be updated
    const allowedFields = ["name", "displayName", "bio", "image", "bannerImage", "websiteUrl"];

    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updates,
      select: {
        id: true,
        name: true,
        displayName: true,
        email: true,
        image: true,
        bannerImage: true,
        bio: true,
        websiteUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
