import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/auth.const";
import { env } from "@/lib/env";

export async function POST(request: Request) {
  const { token, expiresAt } = await request.json();

  // Set the auth cookie
  cookies().set(AUTH_COOKIE_NAME, token, {
    expires: new Date(expiresAt),
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  // Clear the auth cookie
  cookies().delete(AUTH_COOKIE_NAME);
  return NextResponse.json({ success: true });
}
