"use server";

import { action } from "@/lib/actions/safe-actions";
import { auth } from "@/lib/auth/helper";
import { env } from "@/lib/env";
import { sendEmail } from "@/lib/mail/sendEmail";
import { prisma } from "@/lib/prisma";
import { ContactFeedbackSchema } from "./contact-feedback.schema";
import { FeedbackEmail } from "../../../../emails/FeedbackEmail";

export const contactSupportAction = action
  .schema(ContactFeedbackSchema)
  .action(async ({ parsedInput: data }) => {
    const session = await auth();

    const email = session?.user?.email ?? data.email;

    const feedback = await prisma.feedback.create({
      data: {
        message: data.message,
        review: Number(data.review) || 0,
        userId: session?.user?.id,
        email,
      },
    });

    await sendEmail({
      to: env.NEXT_PUBLIC_EMAIL_CONTACT,
      subject: `New feedback from ${email}`,
      react: FeedbackEmail({
        review: feedback.review,
        message: feedback.message
      }),
      replyTo: email,
    });

    return { message: "Your feedback has been sent to support." };
  });
