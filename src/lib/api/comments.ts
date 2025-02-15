import kyInstance from "@/lib/ky";
import { CommentData } from "@/lib/types";

interface CreateCommentData {
  content: string;
  postId: string;
}

export async function createComment(data: CreateCommentData): Promise<CommentData> {
  return kyInstance.post(`/api/posts/${data.postId}/comments`, { json: data }).json();
}

export async function deleteComment(commentId: string): Promise<void> {
  await kyInstance.delete(`/api/comments/${commentId}`);
}
