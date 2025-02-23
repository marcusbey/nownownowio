import { ActionButton } from "@/components/core/action-button";
import { useToast } from "@/components/feedback/use-toast";
import { useFollowerInfo } from "@/hooks/use-follower-info";
import kyInstance from "@/lib/ky";
import type { FollowerInfo } from "@/lib/types";
import type { QueryKey } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type FollowButtonProps = {
  userId: string;
  initialState: FollowerInfo;
};

export default function FollowButton({
  userId,
  initialState,
}: FollowButtonProps) {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const { data } = useFollowerInfo(userId, initialState);

  const queryKey: QueryKey = ["follower-info", userId];

  const { mutate } = useMutation({
    mutationFn: async () =>
      data.isFollowedByUser
        ? kyInstance.delete(`/api/v1/users/${userId}/followers`)
        : kyInstance.post(`/api/v1/users/${userId}/followers`),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });

      const previousState = queryClient.getQueryData<FollowerInfo>(queryKey);

      queryClient.setQueryData<FollowerInfo>(queryKey, () => ({
        followers:
          (previousState?.followers || 0) +
          (previousState?.isFollowedByUser ? -1 : 1),
        isFollowedByUser: !previousState?.isFollowedByUser,
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
    <ActionButton
      variant={data.isFollowedByUser ? "secondary" : "primary"}
      onClick={() => mutate()}
    >
      {data.isFollowedByUser ? "Following" : "Follow"}
    </ActionButton>
  );
}
