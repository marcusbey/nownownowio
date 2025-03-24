import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/composite/dropdown-menu";
import { Button } from "@/components/core/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/data-display/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/feedback/alert-dialog";
import { useToast } from "@/components/feedback/use-toast";
import kyInstance from "@/lib/ky";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Heart, MoreHorizontal, Pin, Trash2 } from "lucide-react";
import { useState } from "react";

// Define types for post feed data structure
type PostFeedData = {
  [key: string]: unknown;
  pages: {
    [key: string]: unknown;
    posts: {
      id: string;
      bookmarks?: { userId: string }[];
      [key: string]: unknown;
    }[];
  }[];
};

type LikeButtonProps = {
  postId: string;
  initialLiked?: boolean;
  onLike: (postId: string) => void;
  className?: string;
};

// Like Button Component
export function LikeButton({
  postId,
  initialLiked = false,
  onLike,
  className,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);

  const handleLike = async (e: React.MouseEvent) => {
    // Prevent default to avoid page reload
    e.preventDefault();
    e.stopPropagation();

    setLiked(!liked);
    await onLike(postId);

    // Prevent any potential page reload
    return false;
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      type="button" // Explicitly set type to button
      className={cn(
        "flex items-center gap-2 hover:text-primary",
        liked && "text-primary",
        className,
      )}
      onClick={handleLike}
    >
      <Heart className={cn("h-4 w-4", liked && "fill-current")} />
      <span className="text-sm">Like</span>
    </Button>
  );
}

type BookmarkButtonProps = {
  postId: string;
  initialState?: {
    isBookmarkedByUser: boolean;
  };
  onBookmark?: (postId: string) => void;
  size?: "default" | "icon";
};

// Bookmark Button Component
export function BookmarkButton({
  postId,
  initialState = { isBookmarkedByUser: false },
  onBookmark,
  size = "default",
}: BookmarkButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey = ["bookmark-info", postId];

  // Get the current bookmark status
  const { data = { isBookmarkedByUser: initialState.isBookmarkedByUser } } =
    useQuery({
      queryKey,
      queryFn: async () => {
        try {
          return await kyInstance
            .get(`/api/v1/posts/${postId}/bookmark`, {
              timeout: 3000,
              retry: 1,
            })
            .json<{ isBookmarkedByUser: boolean }>();
        } catch (error) {
          console.error("Error fetching bookmark status:", error);
          return { isBookmarkedByUser: initialState.isBookmarkedByUser };
        }
      },
      initialData: { isBookmarkedByUser: initialState.isBookmarkedByUser },
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    });

  // Handle bookmark toggle with API call
  const { mutate: toggleBookmark } = useMutation({
    mutationFn: async () => {
      const bookmarkStatus = data.isBookmarkedByUser;

      try {
        if (bookmarkStatus) {
          // If already bookmarked, remove bookmark
          await kyInstance.delete(`/api/v1/posts/${postId}/bookmark`, {
            timeout: 5000,
            retry: 1,
          });
          return { isBookmarkedByUser: false };
        } else {
          // If not bookmarked, add bookmark
          await kyInstance.post(`/api/v1/posts/${postId}/bookmark`, {
            timeout: 5000,
            retry: 1,
          });
          return { isBookmarkedByUser: true };
        }
      } catch (error) {
        console.error("Error toggling bookmark:", error);
        throw error; // Let the error handler catch this
      }
    },
    onSuccess: (result) => {
      // Show toast notification
      toast({
        title: `Bookmark ${result.isBookmarkedByUser ? "Added" : "Removed"}`,
        description: `Post ${result.isBookmarkedByUser ? "added to" : "removed from"} bookmarks`,
        duration: 2000,
      });

      // Call the onBookmark callback if provided
      if (onBookmark) {
        onBookmark(postId);
      }
    },
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<{
        isBookmarkedByUser: boolean;
      }>(queryKey);

      // Optimistically update the bookmark status
      queryClient.setQueryData<{ isBookmarkedByUser: boolean }>(
        queryKey,
        (old) => ({
          isBookmarkedByUser: !old?.isBookmarkedByUser,
        }),
      );

      // Also update any post feeds that contain this post
      queryClient.setQueriesData<PostFeedData | undefined>(
        { queryKey: ["post-feed"] },
        (oldData) => {
          if (!oldData) return oldData;

          // This works for the infinite query data structure
          if (oldData.pages) {
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                posts: page.posts.map((post) => {
                  if (post.id === postId) {
                    // Update the bookmarks array optimistically
                    const currentBookmarked = previousData?.isBookmarkedByUser;

                    if (currentBookmarked) {
                      // Remove the bookmark
                      return {
                        ...post,
                        bookmarks: (post.bookmarks ?? []).filter(
                          (b) => b.userId !== "current-user",
                        ),
                      };
                    } else {
                      // Add the bookmark
                      return {
                        ...post,
                        bookmarks: [
                          ...(post.bookmarks ?? []),
                          { userId: "current-user" },
                        ],
                      };
                    }
                  }
                  return post;
                }),
              })),
            };
          }

          return oldData;
        },
      );

      return { previousData };
    },
    onError: (error, _, context) => {
      // Revert to the previous value if mutation fails
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }

      console.error("Bookmark error:", error);

      toast({
        title: "Error",
        description: "Failed to update bookmark. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Update the bookmark info cache with the result
      void queryClient.invalidateQueries({ queryKey });

      // Invalidate related queries to ensure bookmarks page is updated
      void queryClient.invalidateQueries({
        queryKey: ["post-feed", "bookmarks"],
      });
    },
  });

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size={size}
          className={cn(
            "gap-1.5",
            data.isBookmarkedByUser && "text-primary",
            size === "icon" && "h-8 w-8",
          )}
          onClick={() => toggleBookmark()}
        >
          <Bookmark
            className={cn("h-4 w-4", data.isBookmarkedByUser && "fill-current")}
          />
          {size !== "icon" && (
            <span className="text-xs font-medium">Bookmark</span>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {data.isBookmarkedByUser ? "Remove bookmark" : "Add bookmark"}
      </TooltipContent>
    </Tooltip>
  );
}

type PostMoreButtonProps = {
  postId: string;
  onDelete: (postId: string) => void;
  onTogglePin?: (postId: string) => void;
  isPinned?: boolean;
  canPin?: boolean;
  className?: string;
};

// Post More Actions Component
export function PostMoreButton({
  postId,
  onDelete,
  onTogglePin,
  isPinned = false,
  canPin = false,
  className,
}: PostMoreButtonProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleClose = () => {
    setShowDeleteDialog(false);
  };

  const handleDelete = () => {
    onDelete(postId);
    setShowDeleteDialog(false);
  };

  const handleTogglePin = () => {
    if (onTogglePin) {
      onTogglePin(postId);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={className}>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canPin && (
            <>
              <DropdownMenuItem onClick={handleTogglePin}>
                <span className="flex items-center gap-3">
                  <Pin className="size-4" />
                  {isPinned ? "Unpin" : "Pin"}
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
            <span className="flex items-center gap-3 text-destructive">
              <Trash2 className="size-4" />
              Delete
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
