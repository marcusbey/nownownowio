import kyInstance from "@/lib/ky";
import { LikeInfo } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useToast } from "@/components/feedback/use-toast";
import { Button } from "@/components/core/button";

interface LikeButtonProps {
  postId: string;
  initialState: {
    likes: number;
    isLikedByUser: boolean;
  };
  className?: string;
}

export default function LikeButton({
  postId,
  initialState,
  className,
}: LikeButtonProps) {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const queryKey: QueryKey = ["like-info", postId];

  const { data } = useQuery({
    queryKey,
    queryFn: () =>
      kyInstance.get(`/api/v1/posts/${postId}/likes`).json<typeof initialState>(),
    initialData: initialState,
    staleTime: 0, // Set to 0 to refetch on mount
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const { mutate } = useMutation({
    mutationFn: async () => {
      if (data.isLikedByUser) {
        await kyInstance.delete(`/api/v1/posts/${postId}/likes`);
        return { likes: data.likes - 1, isLikedByUser: false };
      } else {
        await kyInstance.post(`/api/v1/posts/${postId}/likes`);
        return { likes: data.likes + 1, isLikedByUser: true };
      }
    },
    onMutate: async () => {
      toast({
        description: `Post ${data.isLikedByUser ? "un" : ""}liked`,
      });

      await queryClient.cancelQueries({ queryKey });

      const previousState = queryClient.getQueryData<typeof initialState>(queryKey);

      queryClient.setQueryData<typeof initialState>(queryKey, (old) => ({
        likes: (old?.likes ?? 0) + (data.isLikedByUser ? -1 : 1),
        isLikedByUser: !old?.isLikedByUser,
      }));

      return { previousState };
    },
    onSuccess: (result) => {
      // Update the like info cache with the result
      queryClient.setQueryData<typeof initialState>(queryKey, result);
      
      // Invalidate related queries to ensure feed is updated
      queryClient.invalidateQueries({ queryKey: ["post-feed"] });
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
        onClick={() => mutate()}
        variant="ghost"
        size="icon"
        className={cn(
          "h-8 w-8 text-muted-foreground/50 hover:text-primary/70",
          data.isLikedByUser && "text-primary/70",
          className
        )}
      >
        <Heart
          className={cn(
            "h-3.5 w-3.5",
            data.isLikedByUser && "fill-current"
          )}
        />
      </Button>
      <span className="text-xs text-muted-foreground/50 tabular-nums -ml-1">
        {data.likes}
      </span>
    </div>
  );
}
