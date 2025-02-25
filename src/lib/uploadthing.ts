import type { AppFileRouter } from "@/app/api/v1/uploadthing/core";
import { generateReactHelpers } from "@uploadthing/react";

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<AppFileRouter>({
    // Override the default uploadthing endpoint to point to our v1 API
    url: "/api/v1/uploadthing",
  });

// Export UTApi for server-side operations if needed
export { UTApi } from "uploadthing/server";
