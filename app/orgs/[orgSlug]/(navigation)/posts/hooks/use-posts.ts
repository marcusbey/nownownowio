import { useState } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFeedPosts, createPost, toggleLike } from "../services/post-manager";
import { useToast } from "@/components/ui/use-toast";

export function usePosts(organizationId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query for fetching posts
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["posts", organizationId],
    queryFn: ({ pageParam }) => getFeedPosts({
      organizationId,
      cursor: pageParam,
    }),
    getNextPageParam: (lastPage) => 
      lastPage.length === 20 ? lastPage[lastPage.length - 1]?.id : undefined,
  });

  // Mutation for creating posts
  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", organizationId] });
      toast({
        title: "Post created",
        description: "Your post has been published successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation for liking posts
  const toggleLikeMutation = useMutation({
    mutationFn: toggleLike,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", organizationId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update like status. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    posts: data?.pages.flat() ?? [],
    isLoading: status === "loading",
    isError: status === "error",
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    createPost: createPostMutation.mutate,
    isCreatingPost: createPostMutation.isPending,
    toggleLike: toggleLikeMutation.mutate,
    isTogglingLike: toggleLikeMutation.isPending,
  };
}
