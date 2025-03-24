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

        // Delete old avatar image if exists
        if (user.image) {
            try {
                const key = user.image.split(
                    `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`
                )[1];
                if (key) {
                    await utapi.deleteFiles(key);
                }
            } catch (deleteError) {
                console.error("Error deleting old avatar image:", deleteError);
                // Continue with upload even if delete fails
            }
        }

        // Upload file directly
        try {
            const uploadResponse = await utapi.uploadFiles(file);

            // Format the URL properly
            const appId = process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID ?? 'nownownow';

            // Extract URL from response - simplified approach with type assertion
            const response = uploadResponse as any;
            let fileUrl: string;

            if (response.data?.url) {
                fileUrl = response.data.url;
            } else if (response.url) {
                fileUrl = response.url;
            } else {
                console.error("Unexpected response format:", response);
                return NextResponse.json({ error: "Could not find URL in response" }, { status: 500 });
            }

            // Format the URL with app ID
            const formattedUrl = fileUrl.replace("/f/", `/a/${appId}/`);

            // Update database with the new avatar image
            await prisma.user.update({
                where: { id: user.id },
                data: { image: formattedUrl },
            });

            // Return the URL
            return NextResponse.json({ url: formattedUrl });

        } catch (uploadError) {
            console.error("UploadThing API error:", uploadError);
            return NextResponse.json({ error: "Upload failed during processing" }, { status: 500 });
        }
    } catch (error) {
        console.error("Error uploading avatar image:", error);
        return NextResponse.json(
            { error: "Failed to upload avatar image" },
            { status: 500 }
        );
    }
} 