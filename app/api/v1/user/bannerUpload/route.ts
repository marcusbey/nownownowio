import { requiredAuth } from "@/lib/auth/helper";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

// Server-side instance
const utapi = new UTApi();

export async function POST(req: Request) {
    try {
        // Authenticate
        const user = await requiredAuth();

        // Get form data
        const formData = await req.formData();
        const file = formData.get("file");

        if (!file || !(file instanceof File)) {
            return NextResponse.json({ error: "No valid file provided" }, { status: 400 });
        }

        // Delete old banner image if exists
        if (user.bannerImage) {
            try {
                const key = user.bannerImage.split(
                    `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`
                )[1];
                if (key) {
                    await utapi.deleteFiles(key);
                }
            } catch (deleteError) {
                console.error("Error deleting old banner image:", deleteError);
                // Continue with upload even if delete fails
            }
        }

        // Upload file directly with simple error handling
        try {
            const uploadResponse = await utapi.uploadFiles(file);

            // Handle possible null response (shouldn't happen, but let's be safe)
            if (!uploadResponse) {
                return NextResponse.json({ error: "Upload failed - no response" }, { status: 500 });
            }

            // Format the URL properly
            const appId = process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID ?? 'nownownow';

            // Extract URL from response - simplified approach
            // We know the response gives us a URL somewhere, even if TS isn't happy
            let fileUrl: string;

            if (typeof uploadResponse === 'object' && uploadResponse !== null) {
                // Type assertion to help TypeScript
                const response = uploadResponse as any;

                if (response.data?.url) {
                    fileUrl = response.data.url as string;
                } else if (response.url) {
                    fileUrl = response.url as string;
                } else {
                    console.error("Unexpected response format:", response);
                    return NextResponse.json({ error: "Could not find URL in response" }, { status: 500 });
                }
            } else {
                console.error("Unexpected response type:", typeof uploadResponse);
                return NextResponse.json({ error: "Invalid response type" }, { status: 500 });
            }

            // Format the URL with app ID
            const formattedUrl = fileUrl.replace("/f/", `/a/${appId}/`);

            // Update database with the new banner image
            await prisma.user.update({
                where: { id: user.id },
                data: { bannerImage: formattedUrl },
            });

            // Return the URL
            return NextResponse.json({ url: formattedUrl });

        } catch (uploadError) {
            console.error("UploadThing API error:", uploadError);
            return NextResponse.json({ error: "Upload failed during processing" }, { status: 500 });
        }
    } catch (error) {
        console.error("Error uploading banner image:", error);
        return NextResponse.json(
            { error: "Failed to upload banner image" },
            { status: 500 }
        );
    }
} 