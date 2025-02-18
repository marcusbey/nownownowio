"use server";

import { authAction } from "@/lib/actions/safe-actions";
import { z } from "zod";

export const uploadImageAction = authAction
  .schema(
    z.object({
      formData: z.instanceof(FormData),
    }),
  )
  .action(async ({ parsedInput: props }) => {
    const formData = props.formData;
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;

    if (!file) {
      throw new Error("No file provided");
    }

    // Convert file to base64 for storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');

    // Store the base64 image in your database
    const imageUrl = `data:${file.type};base64,${base64}`;

    return { url: imageUrl };
  });
