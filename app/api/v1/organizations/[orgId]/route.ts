import { prisma } from "@/lib/prisma";
import { orgRoute } from "@/lib/safe-route";
import { z } from "zod";

export const POST = orgRoute
  .params(
    z.object({
      orgId: z.string(),
    }),
  )
  .body(z.object({ name: z.string() }))
  .handler(async (req, { params, body }) => {
    // Await params before using its properties
    const awaitedParams = await params;
    await prisma.organization.update({
      where: {
        id: awaitedParams.orgId,
      },
      data: {
        name: body.name,
      },
    });
  });
