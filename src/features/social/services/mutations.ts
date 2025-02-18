import { useToast } from "@/components/feedback/use-toast";
import kyInstance from "@/lib/ky";
import {
  useMutation,
  useQueryClient
} from "@tanstack/react-query";
import { useSession } from "next-auth/react";

type SubmitPostInput = {
  content: string;
  mediaIds: string[];
};

export function useSubmitPostMutation() {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const { data: session } = useSession();

  const mutation = useMutation({
    mutationFn: async (input: SubmitPostInput) => {
      const response = await kyInstance.post("/api/v1/posts", { json: input }).json();
      return response;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["post-feed"] });
      toast({
        description: "Post created",
      });
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to post. Please try again.",
      });
    },
  });

  return mutation;
}
