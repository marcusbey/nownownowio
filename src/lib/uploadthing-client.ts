'use client';

import { generateReactHelpers } from "@uploadthing/react";

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
    if (url.includes('8s2dp0f8rl.ufs.sh')) {
        url = url.replace('8s2dp0f8rl.ufs.sh', 'utfs.io');
    }

    // Ensure URL has proper protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        // If it's a UploadThing URL without protocol
        if (url.startsWith('utfs.io/') || url.includes('.utfs.io/')) {
            url = `https://${url}`;
        }
        // Handle relative paths that might be UploadThing URLs
        else if (url.includes('/f/') || url.match(/\/[a-zA-Z0-9_-]{20,}/)) {
            // Extract the file ID and create a proper UploadThing URL
            const fileId = url.split('/').pop();
            if (fileId && fileId.length > 20) {
                url = `https://utfs.io/f/${fileId}`;
            }
        }
    }

    return url;
} 