import { Button } from "@/components/core/button";
import { useToast } from "@/components/feedback/use-toast";
import kyInstance from "@/lib/ky";
import type { BookmarkInfo } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { QueryKey } from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark } from "lucide-react";

type BookmarkButtonProps = {
  postId: string;
  initialState: BookmarkInfo;
  className?: string;
};

export default function BookmarkButton({
  postId,
  initialState,
  className,
}: BookmarkButtonProps) {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const queryKey: QueryKey = ["bookmark-info", postId];

  const { data } = useQuery({
    queryKey,
    queryFn: async () =>
      kyInstance.get(`/api/v1/posts/${postId}/bookmark`).json<BookmarkInfo>(),
    initialData: initialState,
    staleTime: 0, // Set to 0 to refetch on mount
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const { mutate } = useMutation({
    mutationFn: async () => {
      if (data.isBookmarkedByUser) {
        await kyInstance.delete(`/api/v1/posts/${postId}/bookmark`);
        return { isBookmarkedByUser: false };
      } else {
        const response = await kyInstance
          .post(`/api/v1/posts/${postId}/bookmark`)
          .json<BookmarkInfo>();
        return { isBookmarkedByUser: true };
      }
    },
    onMutate: async () => {
      toast({
        description: `Post ${data.isBookmarkedByUser ? "un" : ""}bookmarked`,
      });

      await queryClient.cancelQueries({ queryKey });

      const previousState = queryClient.getQueryData<BookmarkInfo>(queryKey);

      queryClient.setQueryData<BookmarkInfo>(queryKey, () => ({
        isBookmarkedByUser: !previousState?.isBookmarkedByUser,
      }));

      return { previousState };
    },
    onSuccess: (result) => {
      // Update the bookmark info cache with the result
      queryClient.setQueryData<BookmarkInfo>(queryKey, result);

      // Invalidate related queries to ensure bookmarks page is updated
      queryClient.invalidateQueries({ queryKey: ["post-feed", "bookmarks"] });
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
    <Button
      onClick={() => mutate()}
      variant="ghost"
      size="icon"
      className={cn(
        "h-8 w-8 text-muted-foreground/50 hover:text-primary/70",
        data.isBookmarkedByUser && "text-primary/70",
        className,
      )}
    >
      <Bookmark className="size-3.5" />
    </Button>
  );
}
