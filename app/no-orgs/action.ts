"use server";

import { authAction } from "@/lib/actions/safe-actions";
import { createOrganizationQuery } from "@/query/org/org-create.query";
import { z } from "zod";

const CreateCompanySchema = z.object({
    name: z.string().min(1),
    websiteUrl: z.string().url(),
});

export const AddProjectAction = authAction
    .schema(CreateCompanySchema)
    .action(async ({ parsedInput, ctx }) => {
        const org = await createOrganizationQuery({
            name: parsedInput.name,
            websiteUrl: parsedInput.websiteUrl,
            slug: parsedInput.name.toLowerCase().replace(/\s+/g, '-'),
            email: ctx.user.email,
            members: {
                create: {
                    userId: ctx.user.id,
                    roles: ["OWNER"],
                },
            },
        });

        return org;
    });