import { getCurrentOrgBySlug } from "@/lib/organizations/get-org";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * GET handler for organization data by slug
 * Next.js 15 requires awaiting params before accessing properties
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // In Next.js 15, params must be awaited before accessing properties
    const awaitedParams = await params;
    const { slug } = awaitedParams;

    if (!slug) {
      return NextResponse.json(
        { error: "Organization slug is required" },
        { status: 400 }
      );
    }

    // Get organization by slug
    const organization = await getCurrentOrgBySlug(slug);

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ organization });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching organization:", error);
    return NextResponse.json(
      { error: "Failed to fetch organization" },
      { status: 500 }
    );
  }
}
