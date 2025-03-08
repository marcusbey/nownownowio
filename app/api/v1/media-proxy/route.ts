import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

/**
 * Media proxy to handle CORS issues with UploadThing
 * This route fetches the media from UploadThing and serves it through our domain
 * to avoid CORS restrictions
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const token = searchParams.get("token") ?? process.env.UPLOADTHING_TOKEN;

  if (!url) {
    return new NextResponse("Missing URL parameter", { status: 400 });
  }

  try {
    // Validate the URL to ensure it's from a trusted source
    if (!url.includes("utfs.io") && !url.includes("uploadthing.com") && !url.includes("ufs.sh")) {
      return new NextResponse("Invalid URL source", { status: 400 });
    }

    console.log(`[MEDIA_PROXY] Fetching media from: ${url}`);

    // Fetch the media from the source
    const response = await fetch(url, {
      headers: {
        // Add UploadThing authentication headers
        "Accept": "image/*,video/*,*/*",
        "User-Agent": "nownownow-media-proxy",
        ...(token ? {
          "Authorization": `Bearer ${token}`,
          "x-uploadthing-auth": token,
          "x-uploadthing-id": process.env.NEXT_PUBLIC_UPLOADTHING_ID ?? ""
        } : {})
      },
    });

    if (!response.ok) {
      console.error(`[MEDIA_PROXY] Failed to fetch media: ${response.status} ${response.statusText}`);
      return new NextResponse(`Failed to fetch media: ${response.statusText}`, {
        status: response.status
      });
    }

    // Get the content type from the response
    const contentType = response.headers.get("content-type") ?? "application/octet-stream";

    // Get the buffer from the response
    const buffer = await response.arrayBuffer();

    // Return the media with appropriate headers
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("[MEDIA_PROXY] Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
