import { Prisma } from "@prisma/client";

export type User = Prisma.UserGetPayload<{
    select: {
        id: true;
        name: true;
        displayName: true;
        image: true;
        bio: true;
        // Add other fields as needed
    };
}>;

export type Post = Prisma.PostGetPayload<{
    select: {
        id: true;
        content: true;
        createdAt: true;
        // Add other fields if necessary
    };
}>;