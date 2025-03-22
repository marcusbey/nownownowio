import { ENDPOINTS } from "@/lib/api/apiEndpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type PostViews = {
  views: number;
}

type TrackViewParams = {
  postId: string;
  source?: "app" | "widget";
}

async function getPostViews(postId: string): Promise<PostViews> {
  const response = await fetch(ENDPOINTS.POST_VIEWS(postId));
  if (!response.ok) {
    throw new Error("Failed to fetch post views");
  }
  return response.json();
}

async function trackPostView(params: TrackViewParams): Promise<PostViews> {
  const { postId, source = "app" } = params;
  const response = await fetch(ENDPOINTS.TRACK_VIEW, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ postId, source }),
  });

  if (!response.ok) {
    throw new Error("Failed to track post view");
  }

  return response.json();
}

export function usePostViews(postId: string) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["postViews", postId],
    queryFn: async () => getPostViews(postId),
  });

  const { mutate: trackView, isPending: isTrackingView } = useMutation({
    mutationFn: trackPostView,
    onSuccess: (data) => {
      // Update the cache with the new view count
      queryClient.setQueryData(["postViews", postId], data);
    },
  });

  return {
    views: data?.views ?? 0,
    isLoading,
    trackView: (source: "app" | "widget" = "app") => trackView({ postId, source }),
    isTrackingView,
  };
}
