import { PostData, PostFormData } from "../types/types";

export async function getPosts(orgId: string): Promise<PostData[]> {
  const response = await fetch(`/api/posts?orgId=${orgId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }
  return response.json();
}

export async function createPost(data: PostFormData): Promise<PostData> {
  const response = await fetch("/api/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error("Failed to create post");
  }
  
  return response.json();
}

export async function deletePost(postId: string): Promise<void> {
  const response = await fetch(`/api/v1/posts/${postId}`, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    throw new Error("Failed to delete post");
  }
}

export async function likePost(postId: string): Promise<void> {
  const response = await fetch(`/api/v1/posts/${postId}/like`, {
    method: "POST",
  });
  
  if (!response.ok) {
    throw new Error("Failed to like post");
  }
}

export async function bookmarkPost(postId: string): Promise<void> {
  const response = await fetch(`/api/v1/posts/${postId}/bookmark`, {
    method: "POST",
  });
  
  if (!response.ok) {
    throw new Error("Failed to bookmark post");
  }
}
