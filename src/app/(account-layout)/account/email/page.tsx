import { Metadata } from "next";
import { auth } from "@/lib/auth/helper";
import { combineWithParentMetadata } from "@/lib/metadata";
import { getResendInstance } from "@/lib/mail/resend";
import { GetContactResponse } from "resend";
import { prisma } from "@/lib/prisma";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { ToggleEmailCheckbox } from "./ToggleEmailCheckbox";
import { ContactSupportDialog } from "@/features/contact/support/ContactSupportDialog";
import { env } from "@/lib/env";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const generateMetadata = combineWithParentMetadata({
  title: "Email",
  description: "Update your email notifications settings.",
});

export default async function MailProfilePage() {
  const session = await auth();
  if (!session?.user?.email) {
    return redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user || !user.resendContactId) {
    return <ErrorComponent />;
  }

  if (!env.RESEND_AUDIENCE_ID) {
    return <ErrorComponent />;
  }

  const resendClient = await getResendInstance();
  const contact = await resendClient.contacts.get({ 
    id: user.resendContactId,
    audienceId: env.RESEND_AUDIENCE_ID,
  });

  if (!contact) {
    return <ErrorComponent />;
  }

  return (
    <div className="space-y-6">
      <div>
        <Typography variant="h4">Email Settings</Typography>
        <Typography variant="muted">Manage your email preferences and notifications.</Typography>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>
            Choose which emails you want to receive from NowNowNow.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ToggleEmailCheckbox subscribed={!contact.unsubscribed} />
        </CardContent>
        <CardFooter>
          <ContactSupportDialog />
        </CardFooter>
      </Card>
    </div>
  );
}

function ErrorComponent() {
  return (
    <div className="space-y-6">
      <Typography variant="h4">Email Settings</Typography>
      <Typography variant="muted">
        There was an error loading your email settings. Please try again later or contact support.
      </Typography>
      <ContactSupportDialog />
    </div>
  );
}
