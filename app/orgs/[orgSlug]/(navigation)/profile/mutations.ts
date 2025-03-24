import { useToast } from "@/components/feedback/use-toast";
import type { PostsPage } from "@/lib/types";
import { useUploadThing } from "@/lib/uploadthing-client";
import type { UpdateUserProfileValues } from "@/lib/validation";
import type {
  InfiniteData,
  QueryFilters
} from "@tanstack/react-query";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { updateUserProfile } from "./actions";

export function useUpdateProfileMutation() {
  const { toast } = useToast();

  const router = useRouter();

  const queryClient = useQueryClient();

  const { startUpload: startAvatarUpload } = useUploadThing("avatar");
  const { startUpload: startBannerUpload } = useUploadThing("bannerImage");

  const mutation = useMutation({
    mutationFn: async ({
      values,
      avatar,
      bannerImage,
    }: {
      values: UpdateUserProfileValues;
      avatar?: File;
      bannerImage?: File;
    }) => {
      const uploadPromises = [];

      // Add profile update promise
      uploadPromises.push(updateUserProfile(values));

      // Add avatar upload if present
      if (avatar) {
        uploadPromises.push(startAvatarUpload([avatar]));
      } else {
        uploadPromises.push(null);
      }

      // Add banner upload if present
      if (bannerImage) {
        uploadPromises.push(startBannerUpload([bannerImage]));
      } else {
        uploadPromises.push(null);
      }

      return Promise.all(uploadPromises);
    },
    onSuccess: async ([updatedUser, avatarResult, bannerResult]) => {
      const newAvatarUrl = avatarResult?.[0]?.serverData?.avatarUrl;
      const newBannerUrl = bannerResult?.[0]?.serverData?.bannerImageUrl;

      const queryFilter: QueryFilters<InfiniteData<PostsPage, string | null>> = {
        queryKey: ["post-feed"],
      };

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              posts: page.posts.map((post) => {
                if (post.user.id === updatedUser.id) {
                  return {
                    ...post,
                    user: {
                      ...updatedUser,
                      image: newAvatarUrl || updatedUser.image,
                      bannerImage: newBannerUrl || updatedUser.bannerImage,
                    },
                  };
                }
                return post;
              }),
            })),
          };
        },
      );

      router.refresh();

      toast({
        description: "Profile updated",
      });
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to update profile. Please try again.",
      });
    },
  });

  return mutation;
}
