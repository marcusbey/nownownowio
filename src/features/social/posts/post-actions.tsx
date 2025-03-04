import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/composite/dropdown-menu";
import { Button } from "@/components/core/button";
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
import { Bookmark, Heart, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";

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
  initialBookmarked?: boolean;
  onBookmark?: (postId: string) => void;
  className?: string;
};

// Bookmark Button Component
export function BookmarkButton({
  postId,
  initialBookmarked = false,
  onBookmark,
  className,
}: BookmarkButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey = ["bookmark-info", postId];

  // Get the current bookmark status
  const { data } = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const response = await kyInstance
          .get(`/api/v1/posts/${postId}/bookmark`)
          .json<{ isBookmarkedByUser: boolean }>();
        return response;
      } catch (error) {
        console.error("Failed to fetch bookmark status:", error);
        return { isBookmarkedByUser: initialBookmarked };
      }
    },
    initialData: { isBookmarkedByUser: initialBookmarked },
    staleTime: 0, // Refetch on mount
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Handle bookmark toggle with API call
  const { mutate: toggleBookmark } = useMutation({
    mutationFn: async () => {
      if (data.isBookmarkedByUser) {
        await kyInstance.delete(`/api/v1/posts/${postId}/bookmark`);
        return { isBookmarkedByUser: false };
      } else {
        await kyInstance.post(`/api/v1/posts/${postId}/bookmark`);
        return { isBookmarkedByUser: true };
      }
    },
    onMutate: async () => {
      // Show toast message
      toast({
        description: `Post ${data.isBookmarkedByUser ? "removed from" : "added to"} bookmarks`,
      });

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Save previous state
      const previousState = queryClient.getQueryData(queryKey);

      // Optimistically update to the new value
      queryClient.setQueryData(queryKey, {
        isBookmarkedByUser: !data.isBookmarkedByUser,
      });

      if (onBookmark) {
        onBookmark(postId);
      }

      return { previousState };
    },
    onSuccess: (result) => {
      // Update the bookmark info cache with the result
      queryClient.setQueryData(queryKey, result);

      // Invalidate related queries to ensure bookmarks page is updated
      void queryClient.invalidateQueries({
        queryKey: ["post-feed", "bookmarks"],
      });
    },
    onError: (error, variables, context) => {
      // Revert to previous state on error
      queryClient.setQueryData(queryKey, context?.previousState);
      console.error("Bookmark error:", error);
      toast({
        variant: "destructive",
        description: "Failed to update bookmark. Please try again.",
      });
    },
  });

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "flex items-center gap-2 hover:text-primary",
        data.isBookmarkedByUser && "text-primary",
        className,
      )}
      onClick={() => {
        toggleBookmark();
      }}
    >
      <Bookmark
        className={cn("h-4 w-4", data.isBookmarkedByUser && "fill-current")}
      />
      <span className="text-sm">Save</span>
    </Button>
  );
}

type PostMoreButtonProps = {
  postId: string;
  onDelete: (postId: string) => void;
  className?: string;
};

// Post More Actions Component
export function PostMoreButton({
  postId,
  onDelete,
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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={className}>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
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
