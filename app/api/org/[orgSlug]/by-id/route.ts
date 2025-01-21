import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";

export async function GET(
  request: Request,
  { params }: { params: { orgSlug: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
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
      return new NextResponse("Organization not found", { status: 404 });
    }

    return NextResponse.json(organization);
  } catch (error) {
    console.error("[ORGANIZATION_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
