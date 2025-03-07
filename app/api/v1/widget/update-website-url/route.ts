import { prisma } from "@/lib/prisma";
import { orgRoute } from "@/lib/safe-route";
import { z } from "zod";

const updateWebsiteUrlSchema = z.object({
  websiteUrl: z.string().url("Invalid URL format")
});

export const POST = orgRoute
  .body(updateWebsiteUrlSchema)
  .handler(async (req, { body, data: { organization } }) => {
    const updatedOrg = await prisma.organization.update({
      where: { id: organization.id },
      data: { websiteUrl: body.websiteUrl },
      select: {
        id: true,
        websiteUrl: true,
        slug: true
      }
    });

    return Response.json({
      message: "Website URL updated successfully",
      organization: updatedOrg
    });
  });