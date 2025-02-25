"use client";

import PostForm from "./posts/post-form";

export function PostFormWrapper() {
  return (
    <div className="w-full space-y-4 rounded-md border border-border bg-card p-4">
      <h2 className="text-lg font-medium">Create Post</h2>
      <PostForm />
    </div>
  );
}
