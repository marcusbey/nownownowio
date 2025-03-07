"use server";

import { NextResponse } from "next/server";
import { authAction } from "@/lib/actions/safe-actions";
import { createBulkPromotionCode, getPromotionCodeStats } from "@/lib/stripe";
import { z } from "zod";

const PromotionCodeSchema = z.object({
  campaignName: z.string(),
  maxRedemptions: z.number().min(1).optional(),
  expiresInDays: z.number().optional(),
});

export type PromotionCodeInput = z.infer<typeof PromotionCodeSchema>;

async function createPromotionCode(input: PromotionCodeInput) {
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

async function getPromotionStats(code: string) {
  return getPromotionCodeStats(code);
}

export async function POST(request: Request) {
  const data = await request.json();
  const result = await createPromotionCode(data);
  return NextResponse.json(result);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  if (!code) {
    return NextResponse.json({ error: 'Code parameter is required' }, { status: 400 });
  }
  const result = await getPromotionStats(code);
  return NextResponse.json(result);
}
