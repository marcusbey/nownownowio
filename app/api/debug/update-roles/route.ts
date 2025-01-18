import { NextRequest, NextResponse } from "next/server";
import { updateMembershipRoles } from "@/lib/organizations/update-roles";
import { auth } from "@/lib/auth/auth";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await updateMembershipRoles();
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error updating roles:", error);
    return NextResponse.json({ error: "Failed to update roles" }, { status: 500 });
  }
}
