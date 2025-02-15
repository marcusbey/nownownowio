import { ExtendedPost } from "@/features/posts/types";
import kyInstance from "@/lib/ky";

interface GetPostsParams {
  organizationId?: string;
  cursor?: string;
  limit?: number;
}

interface PostsResponse {
  posts: ExtendedPost[];
}

interface CreatePostResponse {
  post: ExtendedPost;
}

export async function getPosts(params: GetPostsParams): Promise<ExtendedPost[]> {
  const searchParams = new URLSearchParams();
  if (params.organizationId) searchParams.set("organizationId", params.organizationId);
  if (params.cursor) searchParams.set("cursor", params.cursor);
  if (params.limit) searchParams.set("limit", params.limit.toString());

  const response = await kyInstance.get("api/posts", { searchParams }).json<PostsResponse>();
  return response.posts;
}

export async function createPost(data: {
  content: string;
  userId: string;
  organizationId: string;
}): Promise<ExtendedPost> {
  const response = await kyInstance.post("api/posts", { json: data }).json<CreatePostResponse>();
  return response.post;
}
