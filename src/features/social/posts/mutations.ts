import { useToast } from "@/components/feedback/use-toast";
import type { PostsPage } from "@/lib/types";
import type {
  InfiniteData
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
      // First, handle the main feed query
      const mainQueryFilter = {
        queryKey: ["post-feed", "for-you"],
        exact: true,
      };

      // Cancel any in-flight queries
      await queryClient.cancelQueries(mainQueryFilter);

      // Update the cache directly to remove the deleted post
      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        mainQueryFilter,
        (oldData) => {
          if (!oldData) return oldData;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              posts: page.posts.filter((p) => p.id !== deletedPost.id) || [],
            })),
          };
        }
      );

      // Also update the following feed if it exists
      const followingQueryFilter = {
        queryKey: ["post-feed", "following"],
        exact: true,
      };

      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        followingQueryFilter,
        (oldData) => {
          if (!oldData) return oldData;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              posts: page.posts.filter((p) => p.id !== deletedPost.id) || [],
            })),
          };
        }
      );

      // Update user-specific feeds
      // First, update the user-posts query with the old key format
      const userQueryFilter = {
        queryKey: ["user-posts", deletedPost.userId],
        exact: true,
      };

      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        userQueryFilter,
        (oldData) => {
          if (!oldData) return oldData;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              posts: page.posts.filter((p) => p.id !== deletedPost.id) || [],
            })),
          };
        }
      );
      
      // Also update the post-feed user-posts query format used in the profile page
      const profileQueryFilter = {
        queryKey: ["post-feed", "user-posts", deletedPost.userId],
        exact: true,
      };

      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        profileQueryFilter,
        (oldData) => {
          if (!oldData) return oldData;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              posts: page.posts.filter((p) => p.id !== deletedPost.id) || [],
            })),
          };
        }
      );

      // Show success toast
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

export function useTogglePinPostMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: togglePinPost,
    onSuccess: async (updatedPost) => {
      // First, handle the main feed query
      const mainQueryFilter = {
        queryKey: ["post-feed", "for-you"],
        exact: true,
      };

      // Cancel any in-flight queries
      await queryClient.cancelQueries(mainQueryFilter);

      // Update the cache directly to update the pinned post
      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        mainQueryFilter,
        (oldData) => {
          if (!oldData) return oldData;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              posts: page.posts.map((p) =>
                p.id === updatedPost.id ? updatedPost : p
              ) || [],
            })),
          };
        }
      );

      // Also update the following feed if it exists
      const followingQueryFilter = {
        queryKey: ["post-feed", "following"],
        exact: true,
      };

      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        followingQueryFilter,
        (oldData) => {
          if (!oldData) return oldData;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              posts: page.posts.map((p) =>
                p.id === updatedPost.id ? updatedPost : p
              ) || [],
            })),
          };
        }
      );

      // Update user-specific feeds
      const userQueryFilter = {
        queryKey: ["user-posts", updatedPost.userId],
        exact: true,
      };

      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        userQueryFilter,
        (oldData) => {
          if (!oldData) return oldData;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              posts: page.posts.map((p) =>
                p.id === updatedPost.id ? updatedPost : p
              ) || [],
            })),
          };
        }
      );

      // Show success toast
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
