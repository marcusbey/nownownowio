import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  const providers = {
    google: true,
    twitter: true,
    credentials: true
  };
  return NextResponse.json(providers);
}
