import { authAction } from "@/lib/actions/safe-actions";
import { createCommunityPromotionCode } from "@/lib/stripe";
import { z } from "zod";

export const createCommunityPromotionCodeAction = authAction
  .schema(
    z.object({
      communityName: z.string(),
      maxRedemptions: z.number().optional(),
      expiresInDays: z.number().optional(),
    })
  )
  .action(async ({ parsedInput: input }) => {
    const expiresAt = input.expiresInDays
      ? Math.floor(Date.now() / 1000) + input.expiresInDays * 24 * 60 * 60
      : undefined;

    const promotionCode = await createCommunityPromotionCode({
      name: input.communityName,
      maxRedemptions: input.maxRedemptions,
      expiresAt,
    });

    return promotionCode;
  });
