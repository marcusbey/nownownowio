"use server";

import { authAction } from "@/lib/actions/safe-actions";
import { createBulkPromotionCode, getPromotionCodeStats } from "@/lib/stripe";
import { z } from "zod";

const PromotionCodeSchema = z.object({
  campaignName: z.string(),
  maxRedemptions: z.number().min(1).optional(),
  expiresInDays: z.number().optional(),
});

export type PromotionCodeInput = z.infer<typeof PromotionCodeSchema>;

export async function createPromotionCode(input: PromotionCodeInput) {
  const expiresAt = input.expiresInDays
    ? Math.floor(Date.now() / 1000) + input.expiresInDays * 24 * 60 * 60
    : undefined;

  const promotionCode = await createBulkPromotionCode({
    campaignName: input.campaignName,
    maxRedemptions: input.maxRedemptions,
    expiresAt,
  });

  return promotionCode;
}

export async function getPromotionStats(code: string) {
  return getPromotionCodeStats(code);
}
