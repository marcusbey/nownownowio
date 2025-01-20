import { Metadata } from "next";
import { auth } from "@/lib/auth/helper";
import { combineWithParentMetadata } from "@/lib/metadata";
import { getResendInstance } from "@/lib/mail/resend";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
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

  const resend = await getResendInstance();
  const contact = await resend.contacts.get(user.resendContactId);

  if (!contact) {
    return <ErrorComponent />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Preferences</CardTitle>
        <CardDescription>
          Manage your email notification preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ToggleEmailCheckbox unsubscribed={contact.unsubscribed} />
      </CardContent>
    </Card>
  );
}

const ErrorComponent = () => {
  return (
    <Card variant="error">
      <CardHeader>
        <CardTitle>Resend not found</CardTitle>
        <CardDescription>
          We couldn't find your Resend contact. Please contact support.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <ContactSupportDialog />
      </CardFooter>
    </Card>
  );
};
