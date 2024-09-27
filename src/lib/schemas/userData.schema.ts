import { z } from "zod";

export const UserSchema = z.object({
    id: z.string(),
    name: z.string().nullable(),
    displayName: z.string().nullable(),
    image: z.string().nullable(),
    bio: z.string().nullable(),
});

export const RecentPostSchema = z.object({
    id: z.string(),
    content: z.string(),
    createdAt: z.string(),
});

export const UserDataSchema = z.object({
    user: UserSchema.nullable(),
    recentPosts: z.array(RecentPostSchema),
});

export type UserData = z.infer<typeof UserDataSchema>;