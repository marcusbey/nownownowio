import kyInstance from "@/lib/ky";
import { BookmarkInfo } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Bookmark } from "lucide-react";
import { useToast } from "../ui/use-toast";
import { Button } from "../ui/button";

interface BookmarkButtonProps {
  postId: string;
  initialState: BookmarkInfo;
  className?: string;
}

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
    queryFn: () =>
      kyInstance.get(`/api/v1/posts/${postId}/bookmark`).json<BookmarkInfo>(),
    initialData: initialState,
    staleTime: 0, // Set to 0 to always refetch on component mount
  });

  const { mutate } = useMutation({
    mutationFn: () =>
      data.isBookmarkedByUser
        ? kyInstance.delete(`/api/v1/posts/${postId}/bookmark`)
        : kyInstance.post(`/api/v1/posts/${postId}/bookmark`),
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
    onSuccess: () => {
      // Invalidate related queries to ensure fresh data
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
        className
      )}
    >
      <Bookmark className="h-3.5 w-3.5" />
    </Button>
  );
}
