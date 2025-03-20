"use server";

import { NextResponse } from "next/server";
import { createBulkPromotionCode, getPromotionCodeStats } from "@/lib/stripe";
import { z } from "zod";

export type PromotionCodeInput = z.infer<typeof promotionCodeSchema>;

const promotionCodeSchema = z.object({
  couponId: z.string(),
  count: z.number().min(1),
  prefix: z.string().optional(),
  expiresInDays: z.number().optional(),
});

async function createPromotionCode(input: PromotionCodeInput) {

  const promotionCode = await createBulkPromotionCode({
    couponId: input.couponId,
    count: input.count,
    prefix: input.prefix,
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
