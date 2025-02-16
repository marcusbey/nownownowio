"use client";

import { PostForm } from "@/components/posts/PostForm";
import type { Organization } from "@prisma/client";

interface PostFormWrapperProps {
  organization: Organization;
  userId: string;
}

export function PostFormWrapper({ organization, userId }: PostFormWrapperProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <PostForm />
    </div>
  );
}
