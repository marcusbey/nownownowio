"use client";

import { useOrganization } from "@/features/organization/hooks/use-organization";
import { useSession } from "next-auth/react";
import { PostForm as BasePostForm } from "@/features/social/posts/post-form";

export default function PostForm() {
  const { data: session } = useSession();
  const { organization } = useOrganization();

  if (!session?.user?.id || !organization) {
    return null;
  }

  return (
    <div className="sticky top-0 z-10 bg-background/80 p-4 backdrop-blur-sm">
      <BasePostForm
        organization={{
          id: organization.id,
          name: organization.name,
        }}
        userId={session.user.id}
      />
    </div>
  );
}
