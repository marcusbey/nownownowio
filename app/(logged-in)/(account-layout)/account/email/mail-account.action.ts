"use server";

import { ActionError, authAction } from "@/lib/actions/safe-actions";
import { env } from "@/lib/env";
import { getResendInstance } from "@/lib/mail/resend";
import { z } from "zod";

const ToggleSubscribedActionSchema = z.object({
  subscribed: z.boolean(),
});

export const toggleSubscribedAction = authAction
  .schema(ToggleSubscribedActionSchema)
  .action(async ({ parsedInput: input, ctx }) => {
    if (!ctx.user.resendContactId) {
      throw new ActionError("User has no resend contact");
    }

    if (!env.RESEND_AUDIENCE_ID) {
      throw new ActionError("RESEND_AUDIENCE_ID is not set");
    }

    const resendClient = await getResendInstance();
    const updateContact = await resendClient.contacts.update({
      audienceId: env.RESEND_AUDIENCE_ID,
      id: ctx.user.resendContactId,
      unsubscribed: !input.subscribed,
    });

    return updateContact;
  });
