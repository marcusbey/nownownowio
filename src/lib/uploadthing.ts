import { generateReactHelpers } from "@uploadthing/react";

export const { useUploadThing, UploadButton, UploadDropzone, Uploader } = generateReactHelpers({
  uploadthingApiEndpoint: "/api/v1/uploadthing"
});
