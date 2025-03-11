import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateRequest } from "@/lib/auth/helper";
import { z } from "zod";

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  displayName: z.string().min(1).optional(),
  email: z.string().email().optional(),
});

export async function PUT(request: NextRequest) {
  try {
    const { user } = await validateRequest();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    
    const validationResult = updateUserSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { message: "Invalid request data", errors: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    const { name, displayName, email } = validationResult.data;
    
    // Only update fields that were provided
    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (displayName !== undefined) updateData.displayName = displayName;
    if (email !== undefined) updateData.email = email;
    
    // Don't proceed if no fields to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "No changes to apply" }, { status: 400 });
    }
    
    // If email is being updated, reset emailVerified
    if (email && email !== user.email) {
      updateData.emailVerified = null;
    }
    
    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        displayName: true,
        email: true,
        emailVerified: true,
      },
    });
    
    return NextResponse.json({ 
      message: "User updated successfully", 
      user: updatedUser 
    });
  } catch (error) {
    console.error("Error updating user:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { message: "Failed to update user" },
      { status: 500 }
    );
  }
}
