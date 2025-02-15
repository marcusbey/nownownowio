import { auth } from "@/lib/auth/helper";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await auth();
    
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const membership = await prisma.membership.findFirst({
      where: {
        userId: user.id,
      },
      include: {
        organization: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (!membership) {
      return new NextResponse("No organization found", { status: 404 });
    }

    return NextResponse.json({
      slug: membership.organization.slug,
    });
  } catch (error) {
    console.error("[GET_FIRST_ORG]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
