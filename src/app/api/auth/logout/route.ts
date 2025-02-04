import { AUTH_COOKIE_NAME } from "@/lib/auth/auth.const";
import { NextResponse } from "next/server";

/**
 * Handles user logout by clearing the session and redirecting to the home page.
 *
 * @returns A Next.js redirect response.
 */
export async function POST() {
    const response = NextResponse.redirect("/");

    // Clear the authentication cookie
    response.cookies.set({
        name: AUTH_COOKIE_NAME,
        value: "",
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        expires: new Date(0), // Expire the cookie immediately
    });

    return response;
}