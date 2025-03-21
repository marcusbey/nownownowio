import { validateRequest } from "@/lib/auth/helper";
import { prisma } from "@/lib/prisma";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UTApi } from "uploadthing/server";

const f = createUploadthing();

export const fileRouter = {
  postMedia: f({
    image: { maxFileSize: "4MB", maxFileCount: 4 },
    video: { maxFileSize: "64MB", maxFileCount: 4 },
  })
    .middleware(async () => {
      const { user } = await validateRequest();
      // Check if user exists
      if (!user) {
        throw new Error('Unauthorized: User not authenticated');
      }
      return { userId: user.id };
    })
    .onUploadComplete(async ({ file }) => {
      // Create a media record in the database
      const media = await prisma.media.create({
        data: {
          url: file.url,
          type: file.type.startsWith("image") ? "IMAGE" : "VIDEO",
          // Media will be associated with a post later
        },
      });

      // Log in development environment only
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log(`[UPLOADTHING] Created media record with ID: ${media.id} for file: ${file.name}`);
      }

      // Return the media ID directly in the response
      return {
        mediaId: media.id,
        url: file.url,
        type: file.type.startsWith("image") ? "IMAGE" : "VIDEO"
      };
    }),

  bannerImage: f({
    image: { maxFileSize: "2MB" },
  })
    .middleware(async () => {
      const { user } = await validateRequest();
      if (!user) {
        throw new Error('Unauthorized: User not authenticated');
      }
      return { user };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const oldBannerImage = metadata.user.bannerImage;

      if (oldBannerImage) {
        const key = oldBannerImage.split(
          `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`,
        )[1];
        await new UTApi().deleteFiles(key);
      }

      const newBannerImage = file.url.replace(
        "/f/",
        `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`,
      );

      await prisma.user.update({
        where: { id: metadata.user.id },
        data: { bannerImage: newBannerImage },
      });

      return { bannerImageUrl: newBannerImage };
    }),

  avatar: f({
    image: { maxFileSize: "512KB" },
  })
    .middleware(async () => {
      const { user } = await validateRequest();
      if (!user) {
        throw new Error('Unauthorized: User not authenticated');
      }
      return { user };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const oldImage = metadata.user.image;

      if (oldImage) {
        const key = oldImage.split(
          `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`,
        )[1];
        await new UTApi().deleteFiles(key);
      }

      const newImage = file.url.replace(
        "/f/",
        `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`,
      );

      await prisma.user.update({
        where: { id: metadata.user.id },
        data: { image: newImage },
      });

      return { avatarUrl: newImage };
    }),
  attachment: f({
    image: { maxFileSize: "4MB", maxFileCount: 5 },
    video: { maxFileSize: "64MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      const { user } = await validateRequest();
      if (!user) {
        throw new Error('Unauthorized: User not authenticated');
      }
      return { userId: user.id };
    })
    .onUploadComplete(async ({ file }) => {
      const media = await prisma.media.create({
        data: {
          url: file.url.replace(
            "/f/",
            `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`,
          ),
          type: file.type.startsWith("image") ? "IMAGE" : "VIDEO",
        },
      });

      return { mediaId: media.id };
    }),
} as FileRouter;

export type AppFileRouter = typeof fileRouter;

