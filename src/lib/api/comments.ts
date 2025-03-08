import kyInstance from "@/lib/ky";
import type { CommentData } from "@/lib/types";

type CreateCommentData = {
  content: string;
  postId: string;
}

export async function createComment(data: CreateCommentData): Promise<CommentData> {
  return kyInstance.post(`/api/v1/posts/${data.postId}/comments`, { json: data }).json();
}

export async function deleteComment(commentId: string): Promise<void> {
  await kyInstance.delete(`/api/v1/comments/${commentId}`);
}
