"use server";

import { validateRequest } from "@/lib/auth/helper";
import { prisma } from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";

export async function deletePost(id: string) {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const post = await prisma.post.findUnique({
    where: { id },
  });

  if (!post) throw new Error("Post not found");

  if (post.userId !== user.id) throw new Error("Unauthorized");

  const deletedPost = await prisma.post.delete({
    where: { id },
    include: getPostDataInclude(user.id),
  });

  return deletedPost;
}

export async function togglePinPost(id: string) {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const post = await prisma.post.findUnique({
    where: { id },
  });

  if (!post) throw new Error("Post not found");

  if (post.userId !== user.id) throw new Error("Unauthorized");

  // Get the user's plan information from their membership
  const userPlan = await prisma.user.findUnique({
    where: { id: user.id },
    select: { planId: true }
  });

  // Check if user has a plan that allows pinning (basic or pro)
  if (!userPlan?.planId) {
    throw new Error("Your current plan doesn't support pinning posts");
  }

  const updatedPost = await prisma.post.update({
    where: { id },
    data: { isPinned: !post.isPinned },
    include: getPostDataInclude(user.id),
  });

  return updatedPost;
}
