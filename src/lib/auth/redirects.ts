import { redirect } from "next/navigation";
import { prisma } from "../prisma";
import { auth } from "./helper";

export async function handleAuthRedirect() {
    const user = await auth();
    if (!user) {
        return null;
    }

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
        return redirect(`/orgs/${organization.slug}`);
    } else {
        return redirect("/orgs/new");
    }
}