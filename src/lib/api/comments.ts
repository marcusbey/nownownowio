import kyInstance from "@/lib/ky";
import { CommentData } from "@/lib/types";

interface CreateCommentParams {
  postId: string;
  content: string;
}

export async function createComment({
  postId,
  content,
}: CreateCommentParams): Promise<CommentData> {
  return kyInstance
    .post(`/api/posts/${postId}/comments`, { json: { content } })
    .json();
}

export async function deleteComment(commentId: string): Promise<void> {
  await kyInstance.delete(`/api/comments/${commentId}`);
}

export async function getComments(postId: string, cursor?: string | null) {
  return kyInstance
    .get(`/api/posts/${postId}/comments`, cursor ? { searchParams: { cursor } } : {})
    .json();
}
