"use client";

import { isActionSuccessful } from "@/lib/actions/actions-utils";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ButtonProps } from "@/components/core/button";
import { LoadingButton } from "@/features/ui/form/submit-button";
import { buyButtonAction } from "./buy-button.action";

type BuyButtonProps = {
  priceId: string;
  orgSlug: string;
} & ButtonProps;

/**
 * This is a button that will create a Stripe checkout session and redirect the user to the checkout page
 * To test the integration, you can use the component like this :
 *
 * ```tsx
 * <BuyButton priceId={env.NODE_ENV === "production" ? "real-price-id" : "dev-price-id"}>Buy now !</BuyButton>
 * ```
 *
 * @param props Button props and Stripe Price Id
 * @param props.priceId This is the Stripe price ID to use for the checkout session
 * @returns
 */
export const BuyButton = ({ priceId, orgSlug, ...props }: BuyButtonProps) => {
  const router = useRouter();
  const session = useSession();

  const mutation = useMutation({
    mutationFn: async () => {
      try {
        if (session.status !== "authenticated") {
          router.push("/auth/signin");
          throw new Error("You must be authenticated to buy a plan");
        }

        const result = await buyButtonAction({
          priceId: priceId,
          orgSlug: orgSlug,
        });

        if (!isActionSuccessful(result)) {
          throw new Error(result?.serverError ?? "Failed to create checkout session");
        }

        if (!result.data?.url) {
          throw new Error("No checkout URL returned from Stripe");
        }

        return result.data.url;
      } catch (error) {
        console.error("BuyButton error:", error);
        throw error;
      }
    },
    onSuccess: (url) => {
      router.push(url);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    }
  });

  return (
    <LoadingButton
      onClick={() => mutation.mutate()}
      {...props}
      loading={mutation.isPending}
      disabled={session.status === "loading"}
    />
  );
};
