"use client";

import { PostForm } from "../post-form";
import type { Organization } from "@prisma/client";

interface PostFormWrapperProps {
  organization: Organization;
  userId: string;
}

export function PostFormWrapper({ organization, userId }: PostFormWrapperProps) {
  return <PostForm organization={organization} userId={userId} />;
}
