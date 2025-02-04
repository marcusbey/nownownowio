import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth/helper";
import { combineWithParentMetadata } from "@/lib/metadata";
import { prisma } from "@/lib/prisma";
import { EditPasswordForm } from "./EditPasswordForm";
import { EditProfileCardForm } from "./EditProfileForm";
import { redirect } from "next/navigation";

export const generateMetadata = combineWithParentMetadata({
  title: "Settings",
  description: "Update your profile.",
});

export const dynamic = "force-dynamic";

export default async function EditProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
    redirect("/sign-in");
  }

  const hasPassword = Boolean(user.passwordHash);

  return (
    <div className="mx-auto max-w-2xl w-full py-6 space-y-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Account Settings</h1>
        </div>
        
        <div className="grid gap-6">
          <EditProfileCardForm defaultValues={user} />
          
          {hasPassword && (
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <CardTitle>Password Settings</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <EditPasswordForm />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
