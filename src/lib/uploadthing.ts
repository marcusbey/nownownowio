import { generateReactHelpers } from "@uploadthing/react";

// Define the AppFileRouter type locally to avoid import issues
type FileRouterTypes = {
  postMedia: {
    image: { maxFileSize: string; maxFileCount: number };
    video: { maxFileSize: string; maxFileCount: number };
  };
  bannerImage: {
    image: { maxFileSize: string };
  };
  avatar: {
    image: { maxFileSize: string };
  };
  attachment: {
    image: { maxFileSize: string; maxFileCount: number };
    video: { maxFileSize: string; maxFileCount: number };
  };
  orgLogo: {
    image: { maxFileSize: string };
  };
  orgBanner: {
    image: { maxFileSize: string };
  };
};

// CLIENT-SIDE EXPORTS
// This section should only be imported in client components
export const { useUploadThing, uploadFiles } =
  generateReactHelpers({
    url: "/api/v1/uploadthing",
  });

// This is a barrel file that re-exports from client and server files
// Client components should import from './uploadthing-client'
// Server components should import from './uploadthing-server'

// Re-export common utilities that are safe for both client and server
export function getDirectUploadthingUrl(url: string): string {
  if (!url) return '';

  // Convert problematic URLs to utfs.io
  if (url.includes('8s2dp0f8rl.ufs.sh')) {
    return url.replace('8s2dp0f8rl.ufs.sh', 'utfs.io');
  }

  return url;
}

// Re-export server-side functions
// These will cause errors if imported in client components
export { uploadthingApi, verifyUploadthingUrl } from './uploadthing-server';

// Note: Client-side exports are not re-exported here to prevent server-side usage
// Import them directly from './uploadthing-client'