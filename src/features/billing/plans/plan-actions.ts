"use server";

import { auth } from "@/lib/auth/helper";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

/**
 * Save the user's plan selection to the database or cookies
 * If the user is authenticated, save to the database
 * If not, save to cookies for retrieval during signup
 */
export async function savePlanSelection(planId: string): Promise<{ success: boolean }> {
  try {
    const session = await auth();
    
    // If user is authenticated, store the selection in cookies
    // We'll use this later when creating or updating an organization
    if (session?.id) {
      // Store the plan selection in cookies for later use in organization creation/update
      const cookieStore = cookies();
      cookieStore.set("selectedPlanId", planId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      });
      
      revalidatePath("/");
      return { success: true };
    } 
    
    // If user is not authenticated, save to cookies
    // This will be used during the signup process
    const cookieStore = cookies();
    cookieStore.set("selectedPlanId", planId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/"
    });
    
    return { success: true };
  } catch (error) {
    console.error("Failed to save plan selection:", error);
    return { success: false };
  }
}

/**
 * Get the user's selected plan from cookies
 * This is used during the signup process
 */
export async function getSelectedPlanFromCookies(): Promise<string | undefined> {
  try {
    const selectedPlanId = cookies().get("selectedPlanId")?.value;
    return selectedPlanId;
  } catch (error) {
    console.error("Failed to get selected plan from cookies:", error);
    return undefined;
  }
}

/**
 * Clear the selected plan cookie
 * This should be called after the user has signed up and the plan has been applied
 */
export async function clearSelectedPlanCookie(): Promise<void> {
  try {
    cookies().delete("selectedPlanId");
  } catch (error) {
    console.error("Failed to clear selected plan cookie:", error);
  }
}
