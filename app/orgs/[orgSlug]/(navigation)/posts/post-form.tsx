"use client";

import { useOrganization } from "@/features/organization/hooks/use-organization";
import { useSession } from "next-auth/react";
import { PostFormWrapper } from "../post-form-wrapper";

export default function PostForm() {
  const { data: session } = useSession();
  const { organization } = useOrganization();

  if (!session?.user?.id || !organization) {
    return null;
  }

  return (
    <PostFormWrapper
      organization={{
        id: organization.id,
        name: organization.name,
      }}
      userId={session.user.id}
    />
  );
}
