import { useToast } from "@/components/feedback/use-toast";
import type { PostsPage } from "@/lib/types";
import type {
  InfiniteData,
  QueryFilters
} from "@tanstack/react-query";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { deletePost, togglePinPost } from "./actions";

export function useDeletePostMutation() {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const router = useRouter();
  const pathname = usePathname();

  const mutation = useMutation({
    mutationFn: deletePost,
    onSuccess: async (deletedPost) => {
      // Define all query keys that need to be updated
      const queryKeys = [
        // Main feed
        ["post-feed"],
        // User-specific feeds
        ["user-posts", deletedPost.userId],
        // For You feed
        ["for-you-posts"],
        // Following feed
        ["following-posts"],
        // Explore feed
        ["explore-posts"],
        // Bookmarked posts
        ["bookmarked-posts"]
      ];

      // Cancel all relevant queries
      await Promise.all(
        queryKeys.map(async key => 
          queryClient.cancelQueries({ queryKey: key, exact: false })
        )
      );

      // Update all relevant query caches
      queryKeys.forEach(key => {
        queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
          { queryKey: key, exact: false },
          (oldData) => {
            if (!oldData) return oldData;

            return {
              pageParams: oldData.pageParams,
              pages: oldData.pages.map((page) => ({
                nextCursor: page.nextCursor,
                posts: page.posts.filter((p) => p.id !== deletedPost.id),
              })),
            };
          }
        );
      });

      // Invalidate queries to trigger refetch if needed
      await Promise.all(
        queryKeys.map(async key => 
          queryClient.invalidateQueries({ queryKey: key, exact: false })
        )
      );

      // Force a refresh
      router.refresh();

      toast({
        description: "Post deleted",
        variant: "default"
      });

      // Redirect if we're on the deleted post's page
      if (pathname === `/posts/${deletedPost.id}`) {
        router.push(`/users/${deletedPost.user.name}`);
      }
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to delete post. Please try again.",
      });
    },
  });

  return mutation;
}

export function useTogglePinPostMutation(): ReturnType<typeof useMutation> {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: togglePinPost,
    onSuccess: async (updatedPost) => {
      // Define all query keys that need to be updated
      const queryKeys = [
        // Main feed
        ["post-feed"],
        // User-specific feeds
        ["user-posts", updatedPost.userId],
        // For You feed
        ["for-you-posts"],
        // Following feed
        ["following-posts"],
        // Explore feed
        ["explore-posts"],
        // Bookmarked posts
        ["bookmarked-posts"]
      ];

      // Cancel all relevant queries
      await Promise.all(
        queryKeys.map(async key => 
          queryClient.cancelQueries({ queryKey: key, exact: false })
        )
      );

      // Update all relevant query caches
      queryKeys.forEach(key => {
        queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
          { queryKey: key, exact: false },
          (oldData) => {
            if (!oldData) return oldData;

            return {
              pageParams: oldData.pageParams,
              pages: oldData.pages.map((page) => ({
                nextCursor: page.nextCursor,
                posts: page.posts.map((p) => 
                  p.id === updatedPost.id ? updatedPost : p
                ),
              })),
            };
          }
        );
      });

      // Invalidate queries to trigger refetch if needed
      await Promise.all(
        queryKeys.map(async key => 
          queryClient.invalidateQueries({ queryKey: key, exact: false })
        )
      );

      // Force a refresh
      router.refresh();

      toast({
        description: updatedPost.isPinned ? "Post pinned" : "Post unpinned",
        variant: "default"
      });
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: error instanceof Error ? error.message : "Failed to update post. Please try again.",
      });
    },
  });

  return mutation;
}
