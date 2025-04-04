import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPosts, createPost, deletePost, likePost, bookmarkPost } from "../services/post-service";
import type { PostFormData } from "../types/types";

export function usePosts(orgId: string) {
  const queryClient = useQueryClient();
  
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ["posts", orgId],
    queryFn: () => getPosts(orgId),
  });

  const createMutation = useMutation({
    mutationFn: async (data: PostFormData) => createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["posts", orgId]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (postId: string) => deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries(["posts", orgId]);
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (postId: string) => likePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries(["posts", orgId]);
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: async (postId: string) => bookmarkPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries(["posts", orgId]);
    },
  });

  return {
    posts,
    isLoading,
    error,
    createPost: createMutation.mutate,
    deletePost: deleteMutation.mutate,
    likePost: likeMutation.mutate,
    bookmarkPost: bookmarkMutation.mutate,
  };
}
