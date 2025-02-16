import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { baseAuth } from "@/lib/auth/auth";

export async function GET(
  request: Request,
  { params }: { params: { orgSlug: string } }
) {
  try {
    // Authentication
    const session = await baseAuth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to access organization data" },
        { status: 401 }
      );
    }

    console.log('[ORG_DEBUG] Looking up org with slug:', params.orgSlug);
    const organization = await prisma.organization.findFirst({
      where: {
        slug: params.orgSlug,
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });
    console.log('[ORG_DEBUG] Found organization:', organization);

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(organization);
  } catch (error) {
    console.error("[ORGANIZATION_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
