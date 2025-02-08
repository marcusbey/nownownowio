import { useState } from "react";
import { BookmarkIcon } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface BookmarkButtonProps {
  postId: string;
  initialIsBookmarked?: boolean;
  bookmarkId?: string;
}

export function BookmarkButton({
  postId,
  initialIsBookmarked = false,
  bookmarkId,
}: BookmarkButtonProps) {
  const { data: session } = useSession();
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isLoading, setIsLoading] = useState(false);

  const handleBookmark = async () => {
    if (!session) {
      toast.error("Please sign in to bookmark posts");
      return;
    }

    setIsLoading(true);
    try {
      if (isBookmarked && bookmarkId) {
        // Remove bookmark
        const response = await fetch(`/api/bookmarks/${bookmarkId}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to remove bookmark");
        setIsBookmarked(false);
        toast.success("Bookmark removed");
      } else {
        // Add bookmark
        const response = await fetch("/api/bookmarks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ postId }),
        });

        if (!response.ok) throw new Error("Failed to bookmark post");
        setIsBookmarked(true);
        toast.success("Post bookmarked");
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.error("Bookmark error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleBookmark}
      disabled={isLoading}
      className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
    >
      {isBookmarked ? (
        <BookmarkSolidIcon className="h-5 w-5" />
      ) : (
        <BookmarkIcon className="h-5 w-5" />
      )}
      <span className="sr-only">{isBookmarked ? "Unbookmark" : "Bookmark"}</span>
    </button>
  );
}
