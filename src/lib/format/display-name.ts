// No direct Prisma import for client-side compatibility

type User = {
  email: string | null;
  name?: string | null;
  displayName?: string | null;
};

/**
 * Formats a display name for a user based on their name or email
 */
export function displayName(user: User): string {
  return user.name
    ? user.name
    : user.email
        ? user.email
            .split("@")[0]
            .replaceAll(".", " ")
            .replace(/^\w/, (c) => c.toUpperCase())
        : "User";
}

/**
 * Generates a username from a user's name
 * If name is not available, falls back to the first part of the email
 * Adds a random number suffix to ensure uniqueness
 */
export function generateUsername(user: User): string {
  let baseUsername = "";
  
  // Try to use displayName first if it exists
  if (user.displayName) {
    baseUsername = user.displayName.toLowerCase();
  }
  // Otherwise use the first part of the name
  else if (user.name) {
    baseUsername = user.name.split(" ")[0].toLowerCase();
  }
  // Fall back to email if no name is available
  else if (user.email) {
    baseUsername = user.email.split("@")[0].toLowerCase();
  }
  // Last resort fallback
  else {
    baseUsername = "user";
  }
  
  // Clean the username: remove special characters and replace spaces with underscores
  baseUsername = baseUsername
    .replace(/[^a-z0-9_]/g, "")
    .replace(/\s+/g, "_");
  
  // Add a random number suffix (100-999)
  const randomSuffix = Math.floor(Math.random() * 900) + 100;
  return `${baseUsername}${randomSuffix}`;
}

/**
 * Checks if a username is available (not already taken by another user)
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/username/check?username=${encodeURIComponent(username)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to check username availability: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.available;
  } catch (error) {
    console.error("Error checking username availability:", error);
    return false;
  }
}

/**
 * Validates a username format
 * - Must be 3-30 characters
 * - Can only contain letters, numbers, and underscores
 * - Cannot start with a number
 */
export function isValidUsernameFormat(username: string): boolean {
  const usernameRegex = /^[a-z][a-z0-9_]{2,29}$/;
  return usernameRegex.test(username);
}

/**
 * Generates a display name with @ symbol for UI display
 */
export function formatDisplayName(user: User): string {
  if (user.displayName) {
    return `@${user.displayName}`;
  }
  
  if (user.name) {
    return `@${user.name.split(" ")[0].toLowerCase()}`;
  }
  
  return "User";
}
