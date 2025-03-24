// SERVER-SIDE EXPORTS
// This file should only be imported in server components or API routes
import { UTApi } from "uploadthing/server";

// Initialize the UploadThing server API
const utapi = new UTApi();

// Helper functions for working with UploadThing URLs (safe for server)
export function getDirectUploadthingUrl(url: string): string {
    if (!url) return '';

    // We want to preserve the original URL format with 8s2dp0f8rl.ufs.sh domain
    // DO NOT convert 8s2dp0f8rl.ufs.sh URLs to utfs.io

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

// Function to make a file public
export async function makeFilePublic(fileKey: string): Promise<string | null> {
    try {
        // Extract the file key if it's a full URL
        if (fileKey.includes('utfs.io/')) {
            fileKey = fileKey.split('/').pop() || fileKey;
        }

        // Use the UploadThing API to make the file public
        const result = await utapi.makeFilePublic(fileKey);
        return result.data?.url || null;
    } catch (error) {
        console.error('Error making file public:', error);
        return null;
    }
}

// Verify if a URL is a valid UploadThing URL
export async function verifyUploadthingUrl(url: string): Promise<boolean> {
    if (!url) return false;

    // Basic validation - check if it's an UploadThing URL
    const isUploadthingUrl = url.includes('utfs.io') || url.includes('uploadthing.com') || url.includes('ufs.sh');
    if (!isUploadthingUrl) return false;

    try {
        // For more advanced validation, you could make a HEAD request to check if the URL exists
        // This is a simple implementation that just checks the URL format
        return true;
    } catch (error) {
        console.error('[UPLOADTHING] Error verifying URL:', error);
        return false;
    }
}

// Create the UploadThing API instance for server-side operations
export async function createUploadThingApi() {
    // Use dynamic import to ensure this only runs on the server
    const { UTApi } = await import("uploadthing/server");

    return new UTApi();
}

// Export a singleton instance for convenience
// Use a function that returns a promise instead of directly calling createUploadThingApi
export const uploadthingApi = {
    async deleteFiles(key: string): Promise<{ success: boolean }> {
        try {
            const api = await createUploadThingApi();
            return await api.deleteFiles(key);
        } catch (error) {
            console.error('[UPLOADTHING] Error deleting files:', error);
            return { success: false };
        }
    }
}; 