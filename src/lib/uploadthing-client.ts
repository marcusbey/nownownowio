'use client';

import { generateReactHelpers } from "@uploadthing/react";

import { env } from "./env";

// Get the UploadThing app ID from environment variables
const UPLOADTHING_APP_ID = env.NEXT_PUBLIC_UPLOADTHING_ID;

// CLIENT-SIDE EXPORTS
// This file should only be imported in client components
export const { useUploadThing, uploadFiles } =
    generateReactHelpers({
        url: "/api/v1/uploadthing",
    });

// Helper functions for working with UploadThing URLs (safe for client)
export function getDirectUploadthingUrl(url: string): string {
    if (!url) return '';

    // Convert problematic URLs to utfs.io
    if (url.includes(`${UPLOADTHING_APP_ID}.ufs.sh`)) {
        url = url.replace(`${UPLOADTHING_APP_ID}.ufs.sh`, 'utfs.io');
    }

    // Check if this is an UploadThing file URL that needs transformation
    if (url.includes('utfs.io/f/')) {
        // For publicly accessible files, we need to use the /p/ endpoint instead of /f/
        // This makes the file publicly accessible without authentication
        url = url.replace('/f/', '/p/');
    }

    // Ensure URL has proper protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        // If it's a UploadThing URL without protocol
        if (url.startsWith('utfs.io/') || url.includes('.utfs.io/')) {
            url = `https://${url}`;
        }
        // Handle relative paths that might be UploadThing URLs
        else if ((url.includes('/f/') || url.includes('/p/')) || url.match(/\/[a-zA-Z0-9_-]{20,}/)) {
            // Extract the file ID and create a proper UploadThing URL with public access
            const fileId = url.split('/').pop();
            if (fileId && fileId.length > 20) {
                url = `https://utfs.io/p/${fileId}`;
            }
        }
    }

    return url;
} 