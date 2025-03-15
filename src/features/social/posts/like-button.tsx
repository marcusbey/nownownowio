import { Button } from "@/components/core/button";
import { useToast } from "@/components/feedback/use-toast";
import kyInstance from "@/lib/ky";
import type { PostsPage } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { InfiniteData, QueryKey } from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";

type LikeButtonProps = {
  postId: string;
  initialState: {
    likes: number;
    isLikedByUser: boolean;
  };
  className?: string;
};

export default function LikeButton({
  postId,
  initialState,
  className,
}: LikeButtonProps) {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  // Validate postId to prevent 404 errors
  const isValidPostId = Boolean(postId && postId !== 'undefined' && postId.trim() !== '');
  
  const queryKey: QueryKey = ["like-info", postId];

  const { data } = useQuery({
    queryKey,
    queryFn: async () => {
      // Skip the API call if postId is invalid
      if (!isValidPostId) {
        return initialState;
      }
      
      return kyInstance
        .get(`/api/v1/posts/${postId}/likes`)
        .json<typeof initialState>();
    },
    initialData: initialState,
    staleTime: 0, // Set to 0 to refetch on mount
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    // Disable the query if postId is invalid
    enabled: isValidPostId,
  });

  const { mutate } = useMutation({
    mutationFn: async () => {
      // Validate postId and ensure data exists
      if (!isValidPostId) {
        throw new Error('Invalid post ID');
      }
      
      if (!data) {
        throw new Error('Like data is not available');
      }
      
      const currentLikes = data.likes ?? 0;
      const isCurrentlyLiked = data.isLikedByUser ?? false;
      
      try {
        if (isCurrentlyLiked) {
          await kyInstance.delete(`/api/v1/posts/${postId}/likes`);
          return { likes: currentLikes - 1, isLikedByUser: false };
        } else {
          await kyInstance.post(`/api/v1/posts/${postId}/likes`);
          return { likes: currentLikes + 1, isLikedByUser: true };
        }
      } catch (error) {
        console.error(`Error toggling like for post ${postId}:`, error);
        throw error;
      }
    },
    onMutate: async () => {
      // Ensure data exists and has required properties
      const isCurrentlyLiked = data?.isLikedByUser ?? false;
      
      toast({
        description: `Post ${isCurrentlyLiked ? "un" : ""}liked`,
      });

      await queryClient.cancelQueries({ queryKey });

      const previousState =
        queryClient.getQueryData<typeof initialState>(queryKey);

      queryClient.setQueryData<typeof initialState>(queryKey, (old) => ({
        likes: (old?.likes ?? 0) + (isCurrentlyLiked ? -1 : 1),
        isLikedByUser: !old?.isLikedByUser,
      }));

      return { previousState };
    },
    onSuccess: (result) => {
      // Update the like info cache with the result
      queryClient.setQueryData<typeof initialState>(queryKey, result);

      // Update the post-feed cache directly
      const postFeedQueryKey = ["post-feed", "for-you"];

      try {
        queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
          { queryKey: postFeedQueryKey, exact: true },
          (oldData) => {
            if (!oldData) return oldData;

            // Update the post in all pages
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                posts: page.posts.map((post) => {
                  if (post.id !== postId) return post;

                  // Update the post's like count and likes array
                  const updatedLikes = result.isLikedByUser
                    ? [...(post.likes ?? []), { userId: "current-user" }]
                    : (post.likes ?? []).filter(
                        (like) => like.userId !== "current-user",
                      );

                  return {
                    ...post,
                    likes: updatedLikes,
                    _count: {
                      ...(post._count ?? {}),
                      likes: result.likes,
                    },
                  };
                }),
              })),
            };
          },
        );
      } catch (error) {
        console.error("Error updating post-feed cache:", error);
        // If cache update fails, invalidate the query to force a refetch
        void queryClient.invalidateQueries({ queryKey: postFeedQueryKey });
      }
    },
    onError(error, variables, context) {
      queryClient.setQueryData(queryKey, context?.previousState);
      console.error(error);
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again.",
      });
    },
  });

  return (
    <div className="flex items-center gap-0.5">
      <Button
        onClick={() => isValidPostId && mutate()}
        variant="ghost"
        size="icon"
        disabled={!isValidPostId}
        className={cn(
          "h-8 w-8 text-muted-foreground/50 hover:text-primary/70",
          data.isLikedByUser && "text-primary/70",
          !isValidPostId && "opacity-50 cursor-not-allowed",
          className,
        )}
      >
        <Heart
          className={cn("h-3.5 w-3.5", data.isLikedByUser && "fill-current")}
        />
      </Button>
      <span className="-ml-1 text-xs tabular-nums text-muted-foreground/50">
        {data.likes}
      </span>
    </div>
  );
}
