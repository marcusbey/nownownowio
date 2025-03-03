"use client";

import { useOrganization } from "@/features/organization/hooks/use-organization";
import { PostForm } from "@/features/social/posts/post-form";
import { useSession } from "next-auth/react";

export function PostFormWrapper() {
  // Add session check for debugging
  const { data: session, status } = useSession();
  const { organization } = useOrganization();

  return (
    <div className="w-full space-y-4 rounded-md border border-border bg-card p-4">
      <h2 className="text-lg font-medium">Create Post</h2>
      {/* Pass the user and organization directly to avoid session issues */}
      {session?.user?.id && organization && (
        <PostForm
          userId={session.user.id}
          userImage={session.user.image ?? null}
          organization={{
            id: organization.id,
            name: organization.name,
          }}
        />
      )}
      {(!session?.user?.id || !organization) && (
        <div className="p-4 text-center text-muted-foreground">
          {!session?.user?.id
            ? "Please log in to create posts."
            : "Organization not found."}
        </div>
      )}
    </div>
  );
}
