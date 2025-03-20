import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Define allowed domains for media sources
const ALLOWED_DOMAINS = [
  "utfs.io",
  "uploadthing.com",
  "ufs.sh",
  ".ufs.sh", // Allow any subdomain of ufs.sh (for app-specific URLs)
  "uploadthing.s3.amazonaws.com",
  "picsum.photos" // Allow picsum.photos for fallback images
];

/**
 * Media proxy to handle CORS issues with UploadThing
 * This route fetches the media from UploadThing and serves it through our domain
 * to avoid CORS restrictions
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const token = searchParams.get("token") ?? env.UPLOADTHING_TOKEN;
  const cacheTime = parseInt(searchParams.get("cache") ?? "31536000", 10); // Default to 1 year

  if (!url) {
    return new NextResponse("Missing URL parameter", { status: 400 });
  }

  try {
    // Validate the URL to ensure it's from a trusted source
    const isAllowedDomain = ALLOWED_DOMAINS.some(domain => url.includes(domain));
    if (!isAllowedDomain) {
      // Only log in development to avoid cluttering production logs
      if (process.env.NODE_ENV === 'development') {
        console.error(`[MEDIA_PROXY] Invalid URL source: ${url}`);
      }
      return new NextResponse("Invalid URL source", { status: 400 });
    }
    
    // Handle UploadThing URL formats
    let processedUrl = url;
    
    // Get the app ID from environment variables
    const appId = env.NEXT_PUBLIC_UPLOADTHING_ID;
    
    // Simplified URL handling for UploadThing URLs
    if (url.includes('utfs.io') && appId) {
      // Extract the file key from legacy utfs.io URLs
      // Try a more permissive regex pattern first
      const matches = url.match(/\/[pf]\/([\w-]+[\w\d]+)/);
      
      // If the first regex doesn't match, try a more generic one that captures everything after /p/ or /f/
      if (!matches) {
        const fullKeyMatches = url.match(/\/[pf]\/(.+)$/);
        
        if (fullKeyMatches?.[1]) {
          // Convert to the new format with the correct app ID
          processedUrl = `https://${appId}.ufs.sh/f/${fullKeyMatches[1]}`;
          // Only log in development to avoid cluttering production logs
          if (process.env.NODE_ENV === 'development') {
            console.log(`[MEDIA_PROXY] Converted legacy URL (full key) to: ${processedUrl}`);
          }
        }
      } else if (matches?.[1]) {
        // Convert to the new format with the correct app ID
        processedUrl = `https://${appId}.ufs.sh/f/${matches[1]}`;
        // Only log in development to avoid cluttering production logs
        if (process.env.NODE_ENV === 'development') {
          console.log(`[MEDIA_PROXY] Converted legacy URL to: ${processedUrl}`);
        }
      }
    }
    
    // Ensure URL has proper protocol
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      processedUrl = `https://${processedUrl}`;
    }

    // Only log in development to avoid cluttering production logs
    if (process.env.NODE_ENV === 'development') {
      console.log(`[MEDIA_PROXY] Fetching media from: ${processedUrl}`);
    }

    // Prepare headers for the fetch request
    const headers: Record<string, string> = {
      "Accept": "image/*,video/*,*/*",
      "User-Agent": "nownownow-media-proxy",
    };

    // Add UploadThing authentication headers if token is available
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      headers["x-uploadthing-auth"] = token;
      
      // Add uploadthing ID if available
      if (appId) {
        headers["x-uploadthing-id"] = appId;
      }
    }

    // Fetch the media with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(processedUrl, {
      headers,
      signal: controller.signal,
      cache: "no-store", // Ensure we don't use a cached response
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      // Only log in development to avoid cluttering production logs
      if (process.env.NODE_ENV === 'development') {
        console.error(`[MEDIA_PROXY] Failed to fetch media: ${response.status} ${response.statusText}`);
      }
      
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

    // Only log in development to avoid cluttering production logs
    if (process.env.NODE_ENV === 'development') {
      console.log(`[MEDIA_PROXY] Successfully fetched media from: ${processedUrl}`);
    }
    
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
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        // Only log in development to avoid cluttering production logs
        if (process.env.NODE_ENV === 'development') {
          console.error(`[MEDIA_PROXY] Request timed out: ${url}`);
        }
        return new NextResponse("Request timed out", { status: 504 });
      }
      
      // Only log in development to avoid cluttering production logs
      if (process.env.NODE_ENV === 'development') {
        console.error(`[MEDIA_PROXY] Error fetching media: ${error.message}`);
      }
      return new NextResponse(`Error fetching media: ${error.message}`, { status: 500 });
    }
    
    // Generic error handling
    // Only log in development to avoid cluttering production logs
    if (process.env.NODE_ENV === 'development') {
      console.error(`[MEDIA_PROXY] Unknown error fetching media: ${String(error)}`);
    }
    return new NextResponse("Error fetching media", { status: 500 });
  }
}
