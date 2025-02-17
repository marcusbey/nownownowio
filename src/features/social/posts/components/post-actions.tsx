import { useState } from "react";
import { Button } from "@/components/core/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/composite/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/feedback/alert-dialog";
import { MoreHorizontal, Bookmark, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

// Like Button Component
export function LikeButton({ postId, initialLiked = false, onLike }) {
  const [liked, setLiked] = useState(initialLiked);

  const handleLike = async () => {
    setLiked(!liked);
    if (onLike) {
      await onLike(postId);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "flex items-center gap-2 hover:text-primary",
        liked && "text-primary"
      )}
      onClick={handleLike}
    >
      <Heart className={cn("h-4 w-4", liked && "fill-current")} />
      <span className="text-sm">Like</span>
    </Button>
  );
}

// Bookmark Button Component
export function BookmarkButton({ postId, initialBookmarked = false, onBookmark }) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);

  const handleBookmark = async () => {
    setBookmarked(!bookmarked);
    if (onBookmark) {
      await onBookmark(postId);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "flex items-center gap-2 hover:text-primary",
        bookmarked && "text-primary"
      )}
      onClick={handleBookmark}
    >
      <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} />
      <span className="text-sm">Save</span>
    </Button>
  );
}

// Post More Actions Component
export function PostMoreButton({ postId, onDelete }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete(postId);
    }
    setShowDeleteDialog(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
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
