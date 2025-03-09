"use server";

import { prisma } from "@/lib/prisma";
import { displayName } from "@/lib/format/display-name";

/**
 * Sets the displayName for a user if it's not already set
 * This is called after a user signs in
 */
export async function setupUserDisplayName(userId: string): Promise<void> {
  // Get the user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      displayName: true,
    },
  });

  if (!user) {
    // User not found, nothing to do
    return;
  }

  // If displayName is already set, don't override it
  if (user.displayName) {
    return;
  }

  // Generate a display name using the utility function
  const generatedDisplayName = displayName(user);

  // Update the user with the generated display name
  await prisma.user.update({
    where: { id: userId },
    data: { displayName: generatedDisplayName },
  });
}
