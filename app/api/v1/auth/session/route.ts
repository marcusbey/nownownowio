import { AUTH_COOKIE_NAME } from "@/lib/auth/auth.const";
import { auth } from "@/lib/auth/helper";
import { env } from "@/lib/env";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) {
    // Return 200 OK with null user for unauthenticated requests
    // NextAuth expects a 200 response, even for unauthenticated users
    return NextResponse.json({
      user: null,
      expires: new Date(Date.now() + 1000).toISOString()
    }, { status: 200 });
  }
  return NextResponse.json(session);
}

export async function POST(request: Request) {
  const { token, expiresAt } = await request.json();

  // Set the auth cookie using responseInit for NextResponse
  const response = NextResponse.json({ success: true });
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    expires: new Date(expiresAt),
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return response;
}

export async function DELETE() {
  // Clear the auth cookie using responseInit for NextResponse
  const response = NextResponse.json({ success: true });
  response.cookies.delete(AUTH_COOKIE_NAME);

  return response;
}
