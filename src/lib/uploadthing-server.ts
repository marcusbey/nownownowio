// SERVER-SIDE EXPORTS
// This file should only be imported in server components or API routes

// Helper functions for working with UploadThing URLs (safe for server)
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