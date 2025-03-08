import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Define allowed domains for media sources
const ALLOWED_DOMAINS = [
  "utfs.io",
  "uploadthing.com",
  "ufs.sh",
  "uploadthing.s3.amazonaws.com"
];

/**
 * Media proxy to handle CORS issues with UploadThing
 * This route fetches the media from UploadThing and serves it through our domain
 * to avoid CORS restrictions
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const token = searchParams.get("token") ?? process.env.UPLOADTHING_TOKEN;
  const cacheTime = parseInt(searchParams.get("cache") ?? "31536000", 10); // Default to 1 year

  if (!url) {
    return new NextResponse("Missing URL parameter", { status: 400 });
  }

  try {
    // Validate the URL to ensure it's from a trusted source
    const isAllowedDomain = ALLOWED_DOMAINS.some(domain => url.includes(domain));
    if (!isAllowedDomain) {
      console.error(`[MEDIA_PROXY] Invalid URL source: ${url}`);
      return new NextResponse("Invalid URL source", { status: 400 });
    }

    console.log(`[MEDIA_PROXY] Fetching media from: ${url}`);

    // Prepare headers for the fetch request
    const headers: Record<string, string> = {
      "Accept": "image/*,video/*,*/*",
      "User-Agent": "nownownow-media-proxy",
    };

    // Add UploadThing authentication headers if token is available
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      headers["x-uploadthing-auth"] = token;
      
      // Add uploadthing ID if available
      const uploadthingId = process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID || 
                          process.env.NEXT_PUBLIC_UPLOADTHING_ID || 
                          "";
      if (uploadthingId) {
        headers["x-uploadthing-id"] = uploadthingId;
      }
    }

    // Fetch the media with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, {
      headers,
      signal: controller.signal,
      cache: "no-store", // Ensure we don't use a cached response
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`[MEDIA_PROXY] Failed to fetch media: ${response.status} ${response.statusText}`);
      
      // Return a more descriptive error based on the status code
      if (response.status === 404) {
        return new NextResponse("Media file not found", { status: 404 });
      }
      
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
        "Cache-Control": `public, max-age=${cacheTime}, immutable`,
        "Access-Control-Allow-Origin": "*",
        "X-Media-Proxy": "nownownow-media-proxy",
      },
    });
  } catch (error) {
    // Handle specific error types
    if (error instanceof TypeError && error.message.includes("aborted")) {
      console.error("[MEDIA_PROXY] Request timeout:", url);
      return new NextResponse("Request timeout", { status: 504 });
    }
    
    console.error("[MEDIA_PROXY] Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
