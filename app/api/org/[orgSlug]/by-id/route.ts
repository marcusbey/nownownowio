import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/connection-manager";
import { auth } from "@/lib/auth/auth";
import { handleDatabaseError } from "@/lib/api/error-handler";
import { Prisma } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: { orgSlug: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ error: "Authentication required" }), 
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const organization = await prisma.organization.findUnique({
      where: { slug: params.orgSlug },
      select: {
        id: true,
        name: true,
        slug: true,
        plan: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!organization) {
      return new NextResponse(
        JSON.stringify({ error: "Organization not found" }), 
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return NextResponse.json(organization);
  } catch (error) {
    console.error("[ORGANIZATION_GET]", error);
    
    return handleDatabaseError(error);
  }
}
