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
import { useToast } from "../ui/use-toast";
import { Button } from "../ui/button";

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
      kyInstance.get(`/api/posts/${postId}/likes`).json<typeof initialState>(),
    initialData: initialState,
    staleTime: Infinity,
  });

  const { mutate } = useMutation({
    mutationFn: () =>
      data.isLikedByUser
        ? kyInstance.delete(`/api/posts/${postId}/likes`)
        : kyInstance.post(`/api/posts/${postId}/likes`),
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
