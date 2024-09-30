import { redirect } from "next/navigation";
import { prisma } from "../prisma";
import { auth } from "./helper";

/**
 * Handles redirection based on user authentication and organization status.
 *
 * - If the user is authenticated and has an organization, redirect to `/orgs/{slug}`.
 * - If the user is authenticated but has no organization, redirect to `/orgs/new`.
 * - If the user is not authenticated, do not redirect.
 *
 * @returns A Next.js redirect response or null.
 */
export async function handleAuthRedirect() {
    const user = await auth();

    if (user) { // User is authenticated
        const organization = await prisma.organization.findFirst({
            where: {
                members: {
                    some: {
                        userId: user.id,
                    },
                },
            },
            select: {
                id: true,
                slug: true,
            },
        });

        if (organization) {
            redirect(`/orgs/${organization.slug}`);
        } else {
            redirect("/orgs/new");
        }
    }

    // If user is not authenticated, do not redirect
    return null;
}