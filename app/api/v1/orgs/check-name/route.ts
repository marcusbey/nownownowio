import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatId } from "@/lib/format/id";
import { RESERVED_SLUGS } from "@/lib/organizations/reserved-slugs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");

    if (!name) {
      return NextResponse.json(
        { available: false, message: "Name is required" },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = formatId(name);

    // Check if slug is reserved
    if (RESERVED_SLUGS.includes(slug)) {
      return NextResponse.json(
        { available: false, message: "This name results in a reserved slug" },
        { status: 200 }
      );
    }

    // Check if organization with this slug already exists
    const existingOrg = await prisma.organization.findUnique({
      where: {
        slug,
      },
    });

    return NextResponse.json(
      {
        available: !existingOrg,
        message: existingOrg
          ? "An organization with this name already exists"
          : "Name is available",
        slug,
      },
      { status: 200 }
    );
  } catch {
    // Error handling without logging
    return NextResponse.json(
      { available: false, message: "Error checking name availability" },
      { status: 500 }
    );
  }
}
